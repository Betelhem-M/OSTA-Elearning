import { useEffect, useState } from "react";
import { Eye, RefreshCw, UserCheck } from "lucide-react";
import { apiRequest, API_BASE_URL } from "@services/api";

export default function InstructorManagement() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadInstructors() {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("osta_token");
      const data = await apiRequest("/instructor-applications?status=approved", { token });
      setInstructors(Array.isArray(data.applications) ? data.applications : []);
    } catch (err) {
      setError(err.message || "Failed to load approved instructors.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInstructors();
  }, []);

  async function openCv(application) {
    try {
      setError("");
      const token = localStorage.getItem("osta_token");
      const response = await fetch(
        `${API_BASE_URL}/instructor-applications/${application.id}/cv`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Unable to open CV.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError(err.message || "Unable to open CV.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-xl font-extrabold text-ink">Instructor Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage approved instructors and access their submitted CVs at any time.
          </p>
        </div>
        <button
          type="button"
          onClick={loadInstructors}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Loading approved instructors...
        </div>
      ) : instructors.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          No approved instructors found.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {instructors.map((application) => (
            <article key={application.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <UserCheck size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black text-ink">
                    {application.applicant.firstName} {application.applicant.lastName}
                  </h2>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {application.applicant.email}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase text-emerald-700">
                  Approved
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Info label="Professional title" value={application.professionalTitle} />
                <Info label="Specialization" value={application.specialization} />
                <Info label="CV" value={application.cvOriginalName || "CV uploaded"} />
                <Info
                  label="Approved on"
                  value={application.reviewedAt ? new Date(application.reviewedAt).toLocaleString() : "—"}
                />
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <p className="text-xs text-slate-400">The original submitted CV remains available after approval.</p>
                <button
                  type="button"
                  onClick={() => openCv(application)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
                >
                  <Eye size={16} />
                  Open CV
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 break-words text-sm leading-6 text-slate-700">{value || "—"}</p>
    </div>
  );
}
