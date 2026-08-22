import { useState } from "react";
import { Trophy, Check, X, ChevronDown } from "lucide-react";
import { reviewSummary } from "@mocks/quizData";

export default function QuizResults() {
  const [reviewOpen, setReviewOpen] = useState(true);

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <header className="flex items-center gap-3 bg-gradient-to-r from-primary to-primary-hover p-5 text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <Trophy size={19} className="text-gold" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold">Quiz Completed!</h2>
          <p className="text-xs text-white/80">
            Great work — here is your performance summary.
          </p>
        </div>
      </header>

      <div className="p-5 sm:p-7">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full bg-primary-light">
            <div className="flex h-[98px] w-[98px] flex-col items-center justify-center rounded-full bg-white">
              <strong className="text-[36px] leading-none text-ink">85%</strong>
              <span className="mt-1 text-[11px] font-medium text-slate-500">
                Your Score
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center gap-3 md:items-start">
            <span className="rounded-full bg-primary px-5 py-2 text-sm font-extrabold text-white">
              ✓ PASSED
            </span>
            <p className="text-sm text-slate-500">
              You cleared the 70% passing score.
            </p>
            <span className="rounded-full bg-gold/20 px-4 py-2 text-sm font-extrabold text-gold-dark">
              +85 XP
            </span>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 md:max-w-[510px] md:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-surface p-3">
              <div className="flex items-center gap-1 text-xs font-bold text-primary">
                <Check size={15} /> Correct
              </div>
              <strong className="mt-1 block text-lg text-ink">8/10</strong>
            </div>
            <div className="rounded-xl border border-slate-100 bg-surface p-3">
              <div className="flex items-center gap-1 text-xs font-bold text-red-600">
                <X size={15} /> Wrong
              </div>
              <strong className="mt-1 block text-lg text-ink">1/10</strong>
            </div>
            <div className="rounded-xl border border-slate-100 bg-surface p-3">
              <div className="text-xs font-bold text-slate-500">— Skipped</div>
              <strong className="mt-1 block text-lg text-ink">1</strong>
            </div>
            <div className="rounded-xl border border-slate-100 bg-surface p-3">
              <div className="text-xs font-bold text-slate-500">Time Used</div>
              <strong className="mt-1 block text-lg text-ink">11:18</strong>
            </div>
          </div>
        </div>

        <div className="mt-7 border-t border-slate-100 pt-5">
          <button
            onClick={() => setReviewOpen((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-extrabold text-ink">
              Review Your Answers
            </span>
            <ChevronDown
              size={18}
              className={`text-slate-500 transition ${reviewOpen ? "rotate-180" : ""}`}
            />
          </button>

          {reviewOpen && (
            <div className="mt-3 space-y-2">
              {reviewSummary.map((item) => (
                <div
                  key={item.question}
                  className="flex flex-col gap-1 rounded-xl bg-surface px-4 py-3 sm:flex-row sm:items-center"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      item.result === "correct"
                        ? "bg-primary-light text-primary"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {item.result === "correct" ? (
                      <Check size={14} />
                    ) : (
                      <X size={14} />
                    )}
                  </span>
                  <span className="w-10 text-xs font-bold text-slate-500">
                    {item.question}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-slate-700">
                    {item.prompt}
                  </span>
                  <span
                    className={`text-xs font-medium ${item.result === "correct" ? "text-primary" : "text-red-500"}`}
                  >
                    {item.detail}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
