import { CheckCircle2 } from "lucide-react";
import { getLetterGrade } from "@utils/grades";

export default function FeedbackPanel({ feedback }) {
  const pct = Math.round((feedback.score / feedback.maxScore) * 100);
  const letterGrade = getLetterGrade(feedback.score, feedback.maxScore);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-primary-light">
          <span className="text-lg font-extrabold text-primary">{pct}%</span>
          {letterGrade && (
            <span className="-mt-0.5 text-[10px] font-bold text-primary">{letterGrade}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-ink">
            {feedback.score} / {feedback.maxScore} points
            {letterGrade && <span className="ml-2 text-slate-400">· Grade {letterGrade}</span>}
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