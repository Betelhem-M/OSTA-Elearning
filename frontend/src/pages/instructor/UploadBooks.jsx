import { useRef, useState } from "react";
import { BookOpen, CheckCircle2, FileUp, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@services/api";

export default function UploadBooks() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!file) {
      setStatus({ type: "error", message: "Please choose a PDF book." });
      return;
    }

    const token = localStorage.getItem("osta_token") || localStorage.getItem("token");
    if (!token) {
      setStatus({ type: "error", message: "Your session has expired. Please sign in again." });
      return;
    }

    const formData = new FormData();
    formData.append("book", file);
    formData.append("title", title);
    formData.append("author", author);
    formData.append("description", description);

    try {
      setUploading(true);
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.message || "Book upload failed");

      setStatus({ type: "success", message: "Book uploaded and published to the public library." });
      setTitle("");
      setAuthor("");
      setDescription("");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Book upload failed" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">Upload Books</h1>
        <p className="mt-2 text-sm text-slate-500">
          Publish PDF books to the OSTA public library. Anyone can read them online; downloading requires registration.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Book title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" placeholder="Introduction to Python" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Author</span>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" placeholder="Author name" />
          </label>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" placeholder="Short description for the public library" />
        </label>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-primary hover:bg-primary/5"
        >
          <FileUp className="text-primary" size={34} />
          <span className="mt-3 text-sm font-bold text-slate-700">{file ? file.name : "Choose PDF book"}</span>
          <span className="mt-1 text-xs text-slate-500">PDF only, maximum 50 MB</span>
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </button>

        {status.message && (
          <div className={`mt-5 flex items-start gap-3 rounded-xl border p-4 ${status.type === "success" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-red-100 bg-red-50 text-red-700"}`}>
            {status.type === "success" ? <CheckCircle2 size={18} /> : <Upload size={18} />}
            <p className="text-sm font-semibold">{status.message}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={() => navigate("/instructor/courses")} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Back</button>
          <button disabled={uploading} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60">
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload Book"}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-800">
        <div className="flex items-center gap-2 font-bold"><BookOpen size={18} /> Public library behavior</div>
        <p className="mt-2 leading-6">Uploaded books appear on the public Books page immediately. Visitors can read them online. The Download action sends visitors to registration/sign-in before allowing the file download.</p>
      </div>
    </section>
  );
}
