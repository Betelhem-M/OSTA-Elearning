import { CheckCircle2 } from "lucide-react";

export default function FeedbackPanel({ feedback }) {
  const pct = Math.round((feedback.score / feedback.maxScore) * 100);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-light">
          <span className="text-lg font-extrabold text-primary">{pct}%</span>
        </div>
        <div>
          <p className="text-sm font-bold text-ink">
            {feedback.score} / {feedback.maxScore} points
          </p>
          <p className="text-xs text-slate-400">
            Graded on {feedback.gradedDate}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {feedback.rubricScores.map((row) => (
          <div
            key={row.criterion}
            className="flex items-center justify-between text-xs"
          >
            <span className="flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 size={13} className="text-primary" />{" "}
              {row.criterion}
            </span>
            <span className="font-semibold text-ink">
              {row.earned}/{row.max}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg bg-surface p-4">
        <p className="text-xs font-bold text-slate-500">Instructor Feedback</p>
        <p className="mt-1.5 text-sm leading-6 text-slate-700">
          {feedback.instructorComment}
        </p>
      </div>
    </div>
  );
}
