import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  MessageSquare,
  FileText,
  Download,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import api from "@services/api";
import { getLetterGrade } from "@utils/grades";
import { downloadAuthenticatedFile } from "@utils/download";

export default function AssignmentEvaluation() {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get("assignmentId");

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Grading modal state
  const [selected, setSelected] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  // =====================================================
  // LOAD SUBMISSIONS
  // =====================================================

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const r = await api.get("/assignments/submissions");
      setRows(r.data?.data || []);
    } catch (e) {
      setError(
        e.response?.data?.message || "Failed to load submissions"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // =====================================================
  // FILTER (search text + optional assignmentId from the URL)
  // =====================================================

  const filtered = useMemo(() => {
    return rows
      .filter((x) =>
        assignmentId
          ? String(x.assignment_id) === String(assignmentId)
          : true
      )
      .filter((x) =>
        `${x.student_name} ${x.assignment_title} ${x.course_title}`
          .toLowerCase()
          .includes(q.toLowerCase())
      );
  }, [rows, q, assignmentId]);

  const filteredAssignmentTitle = useMemo(() => {
    if (!assignmentId) return null;
    const match = rows.find(
      (x) => String(x.assignment_id) === String(assignmentId)
    );
    return match?.assignment_title || null;
  }, [rows, assignmentId]);

  // =====================================================
  // OPEN A SUBMISSION FOR GRADING
  // =====================================================

  async function openSubmission(row) {
    setSelected(row);
    setScore(row.score ?? "");
    setFeedback(row.instructor_comment ?? "");
    setSelectedFiles([]);
    setError("");

    try {
      setFilesLoading(true);

      const r = await api.get(`/assignments/submissions/${row.id}`);
      setSelectedFiles(r.data?.data?.files || []);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to load the submitted files."
      );
    } finally {
      setFilesLoading(false);
    }
  }

  function closeSubmission() {
    setSelected(null);
    setSelectedFiles([]);
    setScore("");
    setFeedback("");
  }

  async function handleDownloadFile(file) {
    if (downloadingFileId) return;

    try {
      setDownloadingFileId(file.id);
      setError("");

      await downloadAuthenticatedFile(
        file.url,
        file.original_name || "submission-file"
      );
    } catch (e) {
      setError(e.message || "Failed to download the file.");
    } finally {
      setDownloadingFileId(null);
    }
  }

  // =====================================================
  // GRADE SUBMISSION
  // =====================================================

  async function grade(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      await api.put(`/assignments/submissions/${selected.id}/grade`, {
        score,
        feedback,
      });

      closeSubmission();
      await load();
    } catch (e) {
      setError(
        e.response?.data?.message || "Failed to grade submission"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      {assignmentId && (
        <Link
          to="/instructor/assignments"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <ArrowLeft size={14} />
          Back to assignments
        </Link>
      )}

      <h1 className="text-3xl font-black text-ink dark:text-white">
        Assignment Evaluation
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        {filteredAssignmentTitle
          ? `Reviewing submissions for "${filteredAssignmentTitle}".`
          : "Review student submissions, assign grades and provide private feedback."}
      </p>

      <div className="relative mt-7">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search student, assignment or course"
          className="h-11 w-full rounded-xl border px-10 dark:bg-slate-900"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Loading submissions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No results found.
          </div>
        ) : (
          filtered.map((x) => (
            <div
              key={x.id}
              className="flex flex-col gap-4 border-b border-slate-100 p-5 last:border-0 md:flex-row md:items-center md:justify-between dark:border-slate-800"
            >
              <div>
                <p className="font-bold text-ink dark:text-white">
                  {x.assignment_title}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {x.student_name} · {x.course_title}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Submitted{" "}
                  {x.submitted_at
                    ? new Date(x.submitted_at).toLocaleString()
                    : "—"}{" "}
                  · Status: {x.status || "pending"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">
                  {x.score != null
                    ? `${x.score}/${x.max_points}${
                        getLetterGrade(x.score, x.max_points)
                          ? ` (${getLetterGrade(x.score, x.max_points)})`
                          : ""
                      }`
                    : "Not graded"}
                </span>
                <button
                  onClick={() => openSubmission(x)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white"
                >
                  <MessageSquare size={16} />{" "}
                  {x.score != null ? "Edit grade" : "Evaluate"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={grade}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 dark:bg-slate-900"
          >
            <h2 className="text-xl font-black">
              Evaluate {selected.student_name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {selected.assignment_title} · Maximum {selected.max_points}{" "}
              points
            </p>

            {/* SUBMITTED FILES */}

            <div className="mt-5">
              <p className="text-sm font-bold text-ink dark:text-white">
                Submitted Files
              </p>

              {filesLoading ? (
                <p className="mt-2 text-xs text-slate-400">
                  Loading files...
                </p>
              ) : selectedFiles.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">
                  No files were attached to this submission.
                </p>
              ) : (
                <div className="mt-2 space-y-2">
                  {selectedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText
                          size={16}
                          className="shrink-0 text-primary"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {file.original_name}
                          </p>
                          {file.file_size && (
                            <p className="text-[11px] text-slate-400">
                              {(Number(file.file_size) / 1024).toFixed(1)}{" "}
                              KB
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadFile(file)}
                        disabled={downloadingFileId === file.id}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-primary transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700"
                      >
                        {downloadingFileId === file.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Download size={13} />
                        )}
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selected.comment && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <p className="font-bold uppercase tracking-wide text-slate-400">
                    Student Comment
                  </p>
                  <p className="mt-1 whitespace-pre-line">
                    {selected.comment}
                  </p>
                </div>
              )}
            </div>

            <label className="mt-5 block text-sm font-bold">
              Score
              <div className="mt-2 flex items-center gap-3">
                <input
                  required
                  type="number"
                  min="0"
                  max={selected.max_points}
                  step="0.01"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="h-11 w-full rounded-lg border px-3"
                />
                {getLetterGrade(score, selected.max_points) && (
                  <span className="shrink-0 rounded-lg bg-primary-light px-3 py-2 text-sm font-bold text-primary">
                    {getLetterGrade(score, selected.max_points)}
                  </span>
                )}
              </div>
            </label>

            <label className="mt-4 block text-sm font-bold">
              Feedback
              <textarea
                rows="5"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-2 w-full rounded-lg border p-3"
                placeholder="Give constructive feedback..."
              />
            </label>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeSubmission}
                className="rounded-lg border px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  "Saving..."
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Save grade
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}