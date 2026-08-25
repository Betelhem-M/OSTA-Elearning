import { useState } from "react";
import {
  Trophy,
  Check,
  X,
  ChevronDown,
} from "lucide-react";

export default function QuizResults({
  result,
  quiz,
}) {
  const [reviewOpen, setReviewOpen] =
    useState(true);

  const percentage =
    Number(
      result?.percentage
    ) || 0;

  const score =
    Number(
      result?.score
    ) || 0;

  const maxScore =
    Number(
      result?.maxScore
    ) || 0;

  const passed =
    Boolean(
      result?.passed
    );

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

      {/* HEADER */}

      <header
        className={`flex items-center gap-3 p-5 text-white ${
          passed
            ? "bg-gradient-to-r from-primary to-primary-hover"
            : "bg-gradient-to-r from-red-600 to-red-700"
        }`}
      >

        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">

          <Trophy
            size={19}
            className="text-gold"
          />

        </span>

        <div>

          <h2 className="text-lg font-extrabold">
            Quiz Completed!
          </h2>

          <p className="text-xs text-white/80">
            Here is your actual quiz performance.
          </p>

        </div>

      </header>

      <div className="p-5 sm:p-7">

        {/* SCORE */}

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

          <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full bg-primary-light">

            <div className="flex h-[98px] w-[98px] flex-col items-center justify-center rounded-full bg-white">

              <strong className="text-[32px] leading-none text-ink">
                {percentage}%
              </strong>

              <span className="mt-1 text-[11px] font-medium text-slate-500">
                Your Score
              </span>

            </div>

          </div>

          <div className="flex flex-1 flex-col items-center gap-3 md:items-start">

            <span
              className={`rounded-full px-5 py-2 text-sm font-extrabold ${
                passed
                  ? "bg-primary text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {passed
                ? "✓ PASSED"
                : "✕ FAILED"}
            </span>

            <p className="text-sm text-slate-500">
              Passing score:{" "}
              {quiz?.pass_percent || 0}%
            </p>

          </div>

          {/* SCORE DETAILS */}

          <div className="grid w-full grid-cols-2 gap-3 md:max-w-[360px]">

            <div className="rounded-xl border border-slate-100 bg-surface p-3">

              <div className="flex items-center gap-1 text-xs font-bold text-primary">
                <Check size={15} />
                Score
              </div>

              <strong className="mt-1 block text-lg text-ink">
                {score}
                {maxScore > 0
                  ? ` / ${maxScore}`
                  : ""}
              </strong>

            </div>

            <div className="rounded-xl border border-slate-100 bg-surface p-3">

              <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                Result
              </div>

              <strong className="mt-1 block text-lg text-ink">
                {passed
                  ? "Passed"
                  : "Failed"}
              </strong>

            </div>

          </div>

        </div>

        {/* REVIEW */}

        <div className="mt-7 border-t border-slate-100 pt-5">

          <button
            type="button"
            onClick={() =>
              setReviewOpen(
                (value) =>
                  !value
              )
            }
            className="flex w-full items-center justify-between text-left"
          >

            <span className="text-sm font-extrabold text-ink">
              Quiz Summary
            </span>

            <ChevronDown
              size={18}
              className={`text-slate-500 transition ${
                reviewOpen
                  ? "rotate-180"
                  : ""
              }`}
            />

          </button>

          {reviewOpen && (
            <div className="mt-3 rounded-xl bg-surface px-4 py-4">

              <p className="text-sm text-slate-600">
                {quiz?.title}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                The score above was calculated by the OSTA backend from your submitted answers.
              </p>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}