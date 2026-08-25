import { useState } from "react";
import {
  Copy,
  Check,
  Minus,
  Plus,
} from "lucide-react";

import AnswerOption from "./AnswerOption";

export default function QuestionCard({
  question,
  selectedOption,
  onSelectOption,
  isFlagged,
  onToggleFlag,
}) {
  const [fontSize, setFontSize] =
    useState(13);

  const [output, setOutput] =
    useState(null);

  const [copyStatus, setCopyStatus] =
    useState("idle");

  function handleRun() {
    // The backend may provide code, but this UI
    // does not include a general-purpose code runner.
    if (!question.code) {
      setOutput(
        "No executable code is provided for this question."
      );

      return;
    }

    setOutput(
      "Code execution is not available in this build."
    );
  }

  async function handleCopy() {
    if (!question.code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        question.code
      );

      setCopyStatus("copied");

      setTimeout(
        () =>
          setCopyStatus("idle"),
        1500
      );
    } catch {
      setCopyStatus("idle");
    }
  }

  return (
    <article className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] sm:p-7">

      {/* HEADER */}

      <header className="flex items-center justify-between gap-3">

        <div className="flex flex-wrap items-center gap-2">

          <span className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-white">
            Question{" "}
            {question.number}
          </span>

          <span className="rounded-full bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-orange-700">
            {question.difficulty ||
              "Medium"}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
            {question.points ||
              1}{" "}
            pts
          </span>

        </div>

        <button
          type="button"
          onClick={
            onToggleFlag
          }
          aria-pressed={
            isFlagged
          }
          aria-label="Flag question"
          className={`rounded-lg p-2 ${
            isFlagged
              ? "bg-gold/10 text-gold"
              : "text-slate-400 hover:bg-gold/10 hover:text-gold"
          }`}
        >
          🚩
        </button>

      </header>

      {/* PROMPT */}

      <h2 className="mt-7 text-lg font-extrabold leading-snug text-ink">
        {question.prompt}
      </h2>

      {/* CODE */}

      {question.code && (
        <>
          <pre
            className="mt-4 overflow-x-auto rounded-xl bg-[#1E2937] p-5 font-mono leading-6 text-slate-200"
            style={{
              fontSize,
            }}
          >
            <code>
              {question.code}
            </code>
          </pre>

          <div className="mt-3 rounded-xl bg-[#0B1117] p-3 font-mono text-[11px] text-[#69d18a]">

            <div className="mb-2 flex items-center justify-between text-[10px] font-sans uppercase tracking-[0.12em] text-slate-500">
              <span>
                Output console
              </span>

              <span>
                {output !== null
                  ? "Result"
                  : "Ready"}
              </span>
            </div>

            <span
              style={{
                whiteSpace:
                  "pre-line",
              }}
            >
              {output !== null
                ? output
                : "> Run code to see output here..."}
            </span>

          </div>

          <footer className="mt-3 flex items-center justify-between text-slate-500">

            <div className="flex gap-1">

              <button
                type="button"
                onClick={
                  handleCopy
                }
                aria-label="Copy code"
                className="rounded-md p-2 hover:bg-slate-100"
              >
                {copyStatus ===
                "copied" ? (
                  <Check size={15} />
                ) : (
                  <Copy size={15} />
                )}
              </button>

              <button
                type="button"
                onClick={
                  handleRun
                }
                className="ml-2 flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-hover"
              >
                ▶ Run Code
              </button>

            </div>

            <div className="flex items-center gap-2 text-[11px]">

              <button
                type="button"
                onClick={() =>
                  setFontSize(
                    (size) =>
                      Math.max(
                        10,
                        size - 1
                      )
                  )
                }
                className="rounded border px-2 py-1 hover:bg-slate-50"
                aria-label="Decrease font size"
              >
                <Minus size={12} />
              </button>

              <span>
                {fontSize}px
              </span>

              <button
                type="button"
                onClick={() =>
                  setFontSize(
                    (size) =>
                      Math.min(
                        18,
                        size + 1
                      )
                  )
                }
                className="rounded border px-2 py-1 hover:bg-slate-50"
                aria-label="Increase font size"
              >
                <Plus size={12} />
              </button>

            </div>

          </footer>
        </>
      )}

      {/* OPTIONS */}

      <p className="mt-5 text-sm font-semibold text-slate-600">
        Select your answer:
      </p>

      <div className="mt-3 space-y-2.5">

        {question.options?.map(
          (option) => (
            <AnswerOption
              key={option.id}
              option={option}
              isSelected={
                Number(
                  selectedOption
                ) ===
                Number(
                  option.id
                )
              }
              onSelect={() =>
                onSelectOption(
                  option.id
                )
              }
            />
          )
        )}

      </div>

    </article>
  );
}