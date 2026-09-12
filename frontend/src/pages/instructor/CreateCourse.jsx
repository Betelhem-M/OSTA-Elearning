import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://osta-elearning-production.up.railway.app/api";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";

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
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  const [form, setForm] = useState({
    title: "",
    description: "",
    longDescription: "",
    categoryId: "",
    level: "Beginner",
    language: "English",
    duration: "",
    estimatedHours: "",
    pricingType: "free",
    price: "",
    telebirrPhone: "",
    cbeAccount: "",
    paymentAccountName: "",
    thumbnailColor: "#2E7D32",
    status: "draft",
  });

  const isPaid = form.pricingType === "paid";

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setError("");
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Categories error:", err);
      setError(err.message || "Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handlePricingTypeChange(value) {
    setForm((previous) => ({
      ...previous,
      pricingType: value,
      ...(value === "free"
        ? { price: "", telebirrPhone: "", cbeAccount: "", paymentAccountName: "" }
        : {}),
    }));
  }

  function handleCategoryChange(event) {
    const { name, value } = event.target;
    setCategoryForm((previous) => ({ ...previous, [name]: value }));
  }

  function openCategoryModal() {
    setCategoryError("");
    setCategoryForm({ name: "", description: "" });
    setShowCategoryModal(true);
  }

  function closeCategoryModal() {
    if (creatingCategory) return;
    setShowCategoryModal(false);
    setCategoryError("");
  }

  async function handleCreateCategory(event) {
    event.preventDefault();
    setCategoryError("");
    if (!categoryForm.name.trim()) {
      setCategoryError("Category name is required.");
      return;
    }

    try {
      setCreatingCategory(true);
      const token = localStorage.getItem("osta_token");
      if (!token) throw new Error("You are not logged in.");

      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create category");

      const newCategory = data.category;
      setCategories((previous) => [...previous, newCategory]);
      setForm((previous) => ({ ...previous, categoryId: String(newCategory.id) }));
      setShowCategoryModal(false);
      setCategoryForm({ name: "", description: "" });
    } catch (err) {
      console.error("Create category error:", err);
      setCategoryError(err.message || "Failed to create category");
    } finally {
      setCreatingCategory(false);
    }
  }

  async function savePaymentAccount(token, method, accountNumber, accountName) {
    if (!accountNumber.trim()) return;

    const response = await fetch(`${API_URL}/instructor/payment-accounts`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ method, accountNumber: accountNumber.trim(), accountName: accountName.trim() }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `Failed to save ${method} payment account`);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) return setError("Course title is required.");
    if (!form.description.trim()) return setError("Course description is required.");
    if (!form.categoryId) return setError("Please select a category.");
    if (!form.language.trim()) return setError("Course language is required.");
    if (!form.duration.trim()) return setError("Course duration is required.");

    const estimatedHours = Number(form.estimatedHours);
    if (!Number.isFinite(estimatedHours) || estimatedHours <= 0) {
      return setError("Estimated learning hours must be greater than 0.");
    }

    if (isPaid) {
      const price = Number(form.price);
      if (!Number.isFinite(price) || price <= 0) return setError("Enter a paid course price greater than 0 ETB.");
      if (!form.paymentAccountName.trim()) return setError("Payment account holder name is required for paid courses.");
      if (!form.telebirrPhone.trim() && !form.cbeAccount.trim()) return setError("Enter at least a Telebirr phone number or a CBE account number.");
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("osta_token");
      if (!token) throw new Error("You are not logged in.");

      const response = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          longDescription: form.longDescription.trim(),
          categoryId: Number(form.categoryId),
          level: form.level,
          language: form.language.trim(),
          duration: form.duration.trim(),
          estimatedHours,
          pricingType: form.pricingType,
          price: isPaid ? Number(form.price) : 0,
          thumbnailColor: form.thumbnailColor,
          status: form.status,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create course");

      if (isPaid) {
        if (form.telebirrPhone.trim()) await savePaymentAccount(token, "telebirr", form.telebirrPhone, form.paymentAccountName);
        if (form.cbeAccount.trim()) await savePaymentAccount(token, "cbe", form.cbeAccount, form.paymentAccountName);
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Create course error:", err);
      setError(err.message || "Failed to create course");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink">Create Course</h1>
          <p className="mt-1 text-sm text-slate-500">Create a new course for your students.</p>
        </div>

        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Course Title</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Enter course title" className={inputClass} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Short Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief description of the course" rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Long Description</label>
            <textarea name="longDescription" value={form.longDescription} onChange={handleChange} placeholder="Detailed description of the course" rows={7} className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Category</label>
              <div className="flex gap-2">
                <select name="categoryId" value={form.categoryId} onChange={handleChange} disabled={loadingCategories} className={`${inputClass} min-w-0 flex-1`}>
                  <option value="">{loadingCategories ? "Loading categories..." : "Select category"}</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                <button type="button" onClick={openCategoryModal} className="h-11 shrink-0 rounded-lg bg-slate-100 px-3 text-sm font-bold text-slate-700 hover:bg-slate-200">+ Add</button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Level</label>
              <select name="level" value={form.level} onChange={handleChange} className={inputClass}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
            <div className="mb-4">
              <h2 className="text-sm font-extrabold text-ink">Course Information</h2>
              <p className="mt-1 text-xs text-slate-500">These details are saved with the course and shown to students.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Language</label>
                <select name="language" value={form.language} onChange={handleChange} className={inputClass}>
                  <option value="English">English</option>
                  <option value="Amharic">Amharic</option>
                  <option value="Afaan Oromo">Afaan Oromo</option>
                  <option value="Arabic">Arabic</option>
                  <option value="French">French</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Duration</label>
                <input type="text" name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 6 Weeks" className={inputClass} />
                <p className="mt-1 text-[11px] text-slate-400">Example: 6 Weeks or 3 Months</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Estimated Learning Hours</label>
                <input type="number" name="estimatedHours" value={form.estimatedHours} onChange={handleChange} min="0.5" step="0.5" placeholder="e.g. 24" className={inputClass} />
                <p className="mt-1 text-[11px] text-slate-400">Total expected study time</p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Course Pricing</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`cursor-pointer rounded-xl border p-4 ${form.pricingType === "free" ? "border-primary bg-primary/5" : "border-slate-200"}`}>
                <input type="radio" name="pricingType" value="free" checked={form.pricingType === "free"} onChange={() => handlePricingTypeChange("free")} className="mr-2" />
                <span className="font-bold text-ink">Free</span>
                <p className="mt-1 text-xs text-slate-500">Students can enroll without payment.</p>
              </label>
              <label className={`cursor-pointer rounded-xl border p-4 ${form.pricingType === "paid" ? "border-primary bg-primary/5" : "border-slate-200"}`}>
                <input type="radio" name="pricingType" value="paid" checked={form.pricingType === "paid"} onChange={() => handlePricingTypeChange("paid")} className="mr-2" />
                <span className="font-bold text-ink">Paid</span>
                <p className="mt-1 text-xs text-slate-500">Students pay the instructor before enrollment.</p>
              </label>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${isPaid ? "border-primary/20 bg-primary/5" : "border-slate-200 bg-slate-50"}`}>
            <p className="mb-4 text-sm font-extrabold text-ink">Payment Information</p>
            <p className="mb-4 text-xs text-slate-500">{isPaid ? "Save the instructor payment details that students will see when they click Enroll on this paid course." : "Payment fields are disabled because this course is free."}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-2 block text-sm font-semibold text-ink">Price (ETB)</label><input type="number" name="price" min="0" step="0.01" value={form.price} onChange={handleChange} disabled={!isPaid} placeholder="e.g. 500" className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`} /></div>
              <div><label className="mb-2 block text-sm font-semibold text-ink">Account Holder / Name</label><input type="text" name="paymentAccountName" value={form.paymentAccountName} onChange={handleChange} disabled={!isPaid} placeholder="Full account holder name" className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`} /></div>
              <div><label className="mb-2 block text-sm font-semibold text-ink">Telebirr Phone</label><input type="text" name="telebirrPhone" value={form.telebirrPhone} onChange={handleChange} disabled={!isPaid} placeholder="e.g. 09XXXXXXXX" className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`} /></div>
              <div><label className="mb-2 block text-sm font-semibold text-ink">CBE Account</label><input type="text" name="cbeAccount" value={form.cbeAccount} onChange={handleChange} disabled={!isPaid} placeholder="CBE account number" className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`} /></div>
            </div>
            {isPaid && <p className="mt-3 text-xs text-slate-500">Enter at least one payment method. The student will be shown the saved account when enrolling.</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Thumbnail Color</label>
              <div className="flex gap-2">
                <input type="color" name="thumbnailColor" value={form.thumbnailColor} onChange={handleChange} className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200" />
                <input type="text" value={form.thumbnailColor} onChange={(event) => setForm((previous) => ({ ...previous, thumbnailColor: event.target.value }))} className={`${inputClass} flex-1`} />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputClass}><option value="draft">Draft</option><option value="published">Published</option></select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={() => navigate("/instructor/dashboard")} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Creating..." : "Create Course"}</button>
          </div>
        </form>
      </div>

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5"><h2 className="text-lg font-extrabold text-ink">Add New Category</h2><p className="mt-1 text-sm text-slate-500">Create a category for your course.</p></div>
            {categoryError && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{categoryError}</div>}
            <form onSubmit={handleCreateCategory}>
              <div className="space-y-4">
                <div><label className="mb-2 block text-sm font-semibold text-ink">Category Name</label><input type="text" name="name" value={categoryForm.name} onChange={handleCategoryChange} placeholder="e.g. Artificial Intelligence" disabled={creatingCategory} autoFocus className={inputClass} /></div>
                <div><label className="mb-2 block text-sm font-semibold text-ink">Description</label><textarea name="description" value={categoryForm.description} onChange={handleCategoryChange} placeholder="Optional category description" rows={4} disabled={creatingCategory} className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={closeCategoryModal} disabled={creatingCategory} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60">Cancel</button>
                <button type="submit" disabled={creatingCategory} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60">{creatingCategory ? "Creating..." : "Create Category"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">✓</div>
            <h2 className="mt-4 text-xl font-extrabold text-ink">Course Created</h2>
            <p className="mt-2 text-sm text-slate-500">Your course was created successfully with language, duration, and estimated learning hours.</p>
            <button type="button" onClick={() => navigate("/instructor/dashboard")} className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover">Go to Dashboard</button>
          </div>
        </div>
      )}
    </>
  );
}
