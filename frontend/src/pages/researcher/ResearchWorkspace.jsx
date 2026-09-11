import { useEffect, useState } from "react";
import { FileText, Save, Send, Upload, Download, Trash2 } from "lucide-react";
import api from "@services/api";

const emptyForm = {
  title: "",
  abstract: "",
  field: "",
  publicationYear: new Date().getFullYear(),
  publicationUrl: "",
  content: "",
};

export default function ResearchWorkspace() {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadResearch() {
    try {
      setLoading(true);
      const response = await api.get("/research/my-publications");
      setDrafts(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your research.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResearch();
  }, []);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setMessage("");
    setError("");
  }

  function editResearch(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      abstract: item.abstract || "",
      field: item.field || "",
      publicationYear: item.publication_year || new Date().getFullYear(),
      publicationUrl: item.publication_url || "",
      content: item.content || "",
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setMessage("");
    setError("");
  }

  async function save(action) {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value ?? ""));
      body.append("action", action);
      if (file) body.append("researchFile", file);

      const response = editingId
        ? await api.put(`/research/publications/${editingId}`, body)
        : await api.post("/research/publications", body);

      setMessage(response.data?.message || (action === "publish" ? "Research submitted for review." : "Research saved as draft."));
      await loadResearch();
      if (action === "publish") resetForm();
      else setEditingId(response.data?.publication?.id || editingId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save research.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteResearch(id) {
    if (!window.confirm("Delete this research draft?")) return;
    try {
      await api.delete(`/research/publications/${id}`);
      if (editingId === id) resetForm();
      await loadResearch();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete research.");
    }
  }

  function downloadFile(id) {
    const base = api.defaults?.baseURL || "";
    window.open(`${base}/research/publications/${id}/file`, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink dark:text-white">Research Workspace</h1>
        <p className="mt-2 text-sm text-slate-500">
          Write your research like a document, save it as a draft, continue later, or submit it for review.
        </p>
      </div>

      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-ink dark:text-white">{editingId ? "Continue research" : "Write research"}</h2>
              <p className="mt-1 text-xs text-slate-500">Your draft stays private until you choose Publish.</p>
            </div>
            {editingId && <button onClick={resetForm} className="text-xs font-bold text-slate-500 hover:text-primary">New research</button>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-ink dark:text-white">Research title</span>
              <input value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Enter your research title" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </label>

            <label>
              <span className="mb-1 block text-sm font-semibold text-ink dark:text-white">Research field</span>
              <input value={form.field} onChange={(e) => updateField("field", e.target.value)} placeholder="e.g. Artificial Intelligence" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </label>

            <label>
              <span className="mb-1 block text-sm font-semibold text-ink dark:text-white">Publication year</span>
              <input type="number" value={form.publicationYear} onChange={(e) => updateField("publicationYear", e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-ink dark:text-white">Abstract</span>
              <textarea value={form.abstract} onChange={(e) => updateField("abstract", e.target.value)} rows={4} placeholder="Briefly explain your research..." className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-ink dark:text-white">Research document</span>
              <textarea value={form.content} onChange={(e) => updateField("content", e.target.value)} rows={18} placeholder="Start writing your research here... You can save at any time and continue later." className="w-full resize-y rounded-xl border border-slate-200 px-4 py-4 text-sm leading-7 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </label>

            <label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
              <Upload size={20} className="text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink dark:text-white">Or upload a research document</p>
                <p className="mt-1 text-xs text-slate-500">PDF, DOC or DOCX, up to 50 MB.</p>
                {file && <p className="mt-1 truncate text-xs font-semibold text-primary">Selected: {file.name}</p>}
              </div>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button disabled={saving} onClick={() => save("draft")} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-ink hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800">
              <Save size={17} /> Save draft
            </button>
            <button disabled={saving} onClick={() => save("publish")} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
              <Send size={17} /> Publish research
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">Publish sends the research to the admin review process. It becomes public only after approval.</p>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            <h2 className="font-bold text-ink dark:text-white">My research</h2>
          </div>
          {loading ? <p className="mt-6 text-sm text-slate-500">Loading...</p> : drafts.length === 0 ? <p className="mt-6 text-sm text-slate-500">No research saved yet.</p> : <div className="mt-5 space-y-3">
            {drafts.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <button onClick={() => editResearch(item)} className="text-left text-sm font-bold text-ink hover:text-primary dark:text-white">{item.title}</button>
                <p className="mt-1 text-xs capitalize text-slate-500">{item.status}</p>
                {item.file_name && <p className="mt-1 truncate text-xs text-slate-400">{item.file_name}</p>}
                <div className="mt-3 flex gap-3">
                  <button onClick={() => editResearch(item)} className="text-xs font-bold text-primary">Open</button>
                  {item.file_name && <button onClick={() => downloadFile(item.id)} className="inline-flex items-center gap-1 text-xs font-bold text-primary"><Download size={13} /> File</button>}
                  <button onClick={() => deleteResearch(item.id)} className="ml-auto text-xs font-bold text-red-500"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>}
        </aside>
      </div>
    </section>
  );
}
