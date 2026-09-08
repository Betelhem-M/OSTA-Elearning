import { useEffect, useState } from "react";
import { BookOpen, Download, FileText, LogIn, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@services/api";

function formatSize(bytes) {
  const value = Number(bytes || 0);
  if (!value) return "PDF";
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadMessage, setDownloadMessage] = useState("");

  async function loadBooks() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/books`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Failed to load books");
      setBooks(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBooks(); }, []);

  async function handleDownload(book) {
    const token = localStorage.getItem("osta_token") || localStorage.getItem("token");
    if (!token) {
      setDownloadMessage("Please register or sign in before downloading this book.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/books/${book.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        setDownloadMessage("Please sign in before downloading this book.");
        return;
      }
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = book.file_name || `${book.title}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadMessage(err.message || "Download failed");
    }
  }

  return (
    <div className="min-h-[70vh] bg-surface px-5 py-12 sm:px-10">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">OSTA Library</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Books & Digital Reading</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Read educational books online for free. Register for an OSTA account when you want to download a copy.</p>
          </div>
          <Link to="/register" className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-hover">Register to download</Link>
        </div>

        {downloadMessage && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
            <span>{downloadMessage}</span>
            <div className="flex gap-2">
              <Link to="/register" className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"><LogIn size={14} /> Register</Link>
              <Link to="/login" className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700">Sign in</Link>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-primary" /></div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-700">{error}</div>
        ) : books.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BookOpen className="mx-auto text-primary" size={38} />
            <h2 className="mt-4 text-lg font-black text-ink">No books published yet</h2>
            <p className="mt-2 text-sm text-slate-500">Books uploaded by OSTA instructors and administrators will appear here.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <article key={book.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary-dark to-primary text-white"><BookOpen size={48} /></div>
                <div className="p-5">
                  <h2 className="line-clamp-2 text-base font-black text-ink">{book.title}</h2>
                  <p className="mt-1 text-xs font-semibold text-primary">{book.author || "OSTA Library"}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{book.description || "Educational reading material available through the OSTA public library."}</p>
                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400"><span className="inline-flex items-center gap-1"><FileText size={13} /> PDF</span><span>{formatSize(book.file_size)}</span></div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <a href={`${API_BASE_URL}/books/${book.id}/read`} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-3 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50">Read online</a>
                    <button onClick={() => handleDownload(book)} className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2.5 text-xs font-bold text-white hover:bg-primary-hover"><Download size={14} /> Download</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
