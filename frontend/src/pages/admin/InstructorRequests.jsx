import { useEffect, useState } from "react";
import { Check, Download, RefreshCw, X } from "lucide-react";
import { apiRequest } from "@services/api";

export default function InstructorRequests() {
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState(null);
  const [note, setNote] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("osta_token");
      const data = await apiRequest(`/instructor-applications?status=${status}`, { token });
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message || "Failed to load instructor requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status]);

  async function review(id, nextStatus) {
    try {
      setReviewing(id);
      const token = localStorage.getItem("osta_token");
      await apiRequest(`/instructor-applications/${id}/review`, {
        token,
        method: "PUT",
        body: { status: nextStatus, adminNote: note },
      });
      setNote("");
      await load();
    } catch (err) {
      setError(err.message || "Failed to review application.");
    } finally {
      setReviewing(null);
    }
  }

  async function downloadCv(application) {
    try {
      const token = localStorage.getItem("osta_token");
      const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${base}/instructor-applications/${application.id}/cv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Unable to download CV.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = application.cvOriginalName || "instructor-cv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Unable to download CV.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-xl font-extrabold text-ink">Instructor Requests</h1>
          <p className="mt-1 text-sm text-slate-500">Review CVs and professional information before granting instructor access.</p>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
        <button onClick={load} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">Loading instructor requests...</div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">No instructor applications found.</div>
      ) : (
        <div className="space-y-5">
          {applications.map((application) => (
            <article key={application.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start gap-4">
                <div className="mr-auto">
                  <h2 className="text-lg font-black text-ink">{application.applicant.firstName} {application.applicant.lastName}</h2>
                  <p className="text-sm text-slate-500">{application.applicant.email} · {application.applicant.phone || "No phone"}</p>
                  <p className="mt-2 text-sm font-bold text-primary">{application.professionalTitle} · {application.specialization}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">{application.status}</span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Info label="Education" value={application.education} />
                <Info label="Experience" value={application.experience} />
                <Info label="Skills" value={application.skills} />
                <Info label="Teaching statement" value={application.teachingStatement} />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                <button onClick={() => downloadCv(application)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  <Download size={16} /> View / download CV
                </button>
                {application.status === "pending" && (
                  <>
                    <input value={reviewing === application.id ? note : ""} onChange={(e) => setNote(e.target.value)} placeholder="Optional admin note" className="h-10 min-w-[220px] flex-1 rounded-lg border border-slate-200 px-3 text-sm" />
                    <button disabled={reviewing === application.id} onClick={() => review(application.id, "approved")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                      <Check size={16} /> Approve
                    </button>
                    <button disabled={reviewing === application.id} onClick={() => review(application.id, "rejected")} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                      <X size={16} /> Reject
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{value || "—"}</p></div>;
}
