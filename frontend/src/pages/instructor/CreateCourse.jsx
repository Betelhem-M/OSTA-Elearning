import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function CreateCourse() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    longDescription: "",
    categoryId: "",
    level: "Beginner",
    price: "0",
    thumbnailColor: "#2E7D32",
    status: "draft",
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/admin/categories`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load categories");
        }

        setCategories(data);
      } catch (err) {
        console.error("Categories error:", err);
        setError(err.message || "Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError("Course title is required.");
      return;
    }

    if (!form.description.trim()) {
      setError("Course description is required.");
      return;
    }

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("osta_token");

      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          longDescription: form.longDescription,
          categoryId: Number(form.categoryId),
          level: form.level,
          price: Number(form.price) || 0,
          thumbnailColor: form.thumbnailColor,
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create course");
      }

      alert("Course created successfully!");

      navigate("/instructor/dashboard");
    } catch (err) {
      console.error("Create course error:", err);
      setError(err.message || "Failed to create course");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-ink">
          Create Course
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a new course for your students.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">
            Course Title
          </label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter course title"
            className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">
            Short Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief description of the course"
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">
            Long Description
          </label>

          <textarea
            name="longDescription"
            value={form.longDescription}
            onChange={handleChange}
            placeholder="Detailed description of the course"
            rows={7}
            className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">
              Category
            </label>

            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              disabled={loadingCategories}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary"
            >
              <option value="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Select category"}
              </option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">
              Level
            </label>

            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">
              Price
            </label>

            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">
              Thumbnail Color
            </label>

            <div className="flex gap-2">
              <input
                type="color"
                name="thumbnailColor"
                value={form.thumbnailColor}
                onChange={handleChange}
                className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200"
              />

              <input
                type="text"
                name="thumbnailColor"
                value={form.thumbnailColor}
                onChange={handleChange}
                className="h-11 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">
            Status
          </label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => navigate("/instructor/dashboard")}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}