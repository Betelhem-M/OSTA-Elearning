import { CalendarClock, FileText } from "lucide-react";

const STATUS_STYLES = {
  not_submitted: {
    label: "Not Submitted",
    className: "bg-slate-100 text-slate-600",
  },
  submitted: { label: "Submitted", className: "bg-primary-light text-primary" },
  graded: { label: "Graded", className: "bg-gold/15 text-gold-dark" },
};

export default function AssignmentCard({ assignment }) {
  const status = STATUS_STYLES[assignment.status];

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
    </div>
  );
}
