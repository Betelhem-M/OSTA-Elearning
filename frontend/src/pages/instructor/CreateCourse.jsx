import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function CreateCourse() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

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
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setError("");

      const response = await fetch(`${API_URL}/categories`);

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

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleCategoryChange(e) {
    const { name, value } = e.target;

    setCategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function openCategoryModal() {
    setCategoryError("");

    setCategoryForm({
      name: "",
      description: "",
    });

    setShowCategoryModal(true);
  }

  function closeCategoryModal() {
    if (creatingCategory) return;

    setShowCategoryModal(false);
    setCategoryError("");
  }

  async function handleCreateCategory(e) {
    e.preventDefault();

    setCategoryError("");

    if (!categoryForm.name.trim()) {
      setCategoryError("Category name is required.");
      return;
    }

    try {
      setCreatingCategory(true);

      const token = localStorage.getItem("osta_token");

      if (!token) {
        setCategoryError("You are not logged in.");
        return;
      }

      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create category"
        );
      }

      const newCategory = data.category;

      setCategories((prev) => [...prev, newCategory]);

      setForm((prev) => ({
        ...prev,
        categoryId: String(newCategory.id),
      }));

      setShowCategoryModal(false);

      setCategoryForm({
        name: "",
        description: "",
      });
    } catch (err) {
      console.error("Create category error:", err);

      setCategoryError(
        err.message || "Failed to create category"
      );
    } finally {
      setCreatingCategory(false);
    }
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

    if (Number(form.price) < 0) {
      setError("Price cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("osta_token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          longDescription: form.longDescription.trim(),
          categoryId: Number(form.categoryId),
          level: form.level,
          price: Number(form.price) || 0,
          thumbnailColor: form.thumbnailColor,
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create course"
        );
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Create course error:", err);

      setError(
        err.message || "Failed to create course"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
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
          {/* Course Title */}
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

          {/* Short Description */}
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

          {/* Long Description */}
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

          {/* Category + Level */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">
                Category
              </label>

              <div className="flex gap-2">
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  disabled={loadingCategories}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select category"}
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={openCategoryModal}
                  className="h-11 shrink-0 rounded-lg bg-slate-100 px-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
                >
                  + Add
                </button>
              </div>
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
                <option value="Intermediate">
                  Intermediate
                </option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Price + Thumbnail */}
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
                  value={form.thumbnailColor}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      thumbnailColor: e.target.value,
                    }))
                  }
                  className="h-11 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Status */}
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

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() =>
                navigate("/instructor/dashboard")
              }
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

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-lg font-extrabold text-ink">
                Add New Category
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create a category for your course.
              </p>
            </div>

            {categoryError && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {categoryError}
              </div>
            )}

            <form onSubmit={handleCreateCategory}>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">
                    Category Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleCategoryChange}
                    placeholder="e.g. Artificial Intelligence"
                    disabled={creatingCategory}
                    autoFocus
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={categoryForm.description}
                    onChange={handleCategoryChange}
                    placeholder="Describe this category"
                    rows={4}
                    disabled={creatingCategory}
                    className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  disabled={creatingCategory}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingCategory
                    ? "Adding..."
                    : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl text-green-600">
                ✓
              </span>
            </div>

            <h2 className="text-lg font-extrabold text-ink">
              Course Created Successfully
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your course has been created successfully.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/instructor/dashboard")
              }
              className="mt-6 w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
}