import { useState } from "react";
import { CalendarClock, FileText, Download, Loader2 } from "lucide-react";
import { downloadAuthenticatedFile } from "@utils/download";

const STATUS_STYLES = {
  not_submitted: {
    label: "Not Submitted",
    className: "bg-slate-100 text-slate-600",
  },
  submitted: { label: "Submitted", className: "bg-primary-light text-primary" },
  graded: { label: "Graded", className: "bg-gold/15 text-gold-dark" },
};

function formatFileSize(bytes) {
  const size = Number(bytes);

  if (!Number.isFinite(size) || size <= 0) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AssignmentCard({ assignment }) {
  const status = STATUS_STYLES[assignment.status];

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  async function handleDownloadAttachment() {
    if (!assignment.attachmentUrl || downloading) {
      return;
    }

    try {
      setDownloading(true);
      setDownloadError("");

      await downloadAuthenticatedFile(
        assignment.attachmentUrl,
        assignment.attachmentName || "assignment-file"
      );
    } catch (err) {
      setDownloadError(
        err.message || "Failed to download the assignment file."
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
            <FileText size={18} />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-ink">
              {assignment.title}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {assignment.courseTitle}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5">
          <CalendarClock size={14} /> Due {assignment.dueDate},{" "}
          {assignment.dueTime}
        </span>
        <span>{assignment.points} points</span>
      </div>

      {/* ASSIGNMENT FILE FROM INSTRUCTOR */}

      {assignment.attachmentUrl && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileText size={18} className="shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-700">
                {assignment.attachmentName || "Assignment file"}
              </p>
              {assignment.attachmentSize && (
                <p className="text-[11px] text-slate-400">
                  {formatFileSize(assignment.attachmentSize)}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadAttachment}
            disabled={downloading}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {downloading ? "Downloading..." : "Download File"}
          </button>
        </div>
      )}

      {downloadError && (
        <p className="mt-2 text-xs font-semibold text-red-600">
          {downloadError}
        </p>
      )}
    </div>
  );
}