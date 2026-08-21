import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { quiz, question4 } from "@mocks/quizData";
import QuestionCard from "@components/quiz/QuestionCard";
import QuizProgressBar from "@components/quiz/QuizProgressBar";
import QuizResults from "@components/quiz/QuizResults";

export default function Quiz() {
  useParams(); // quizId — this build only ever has one real quiz (Python Basics)

  const [selectedOption, setSelectedOption] = useState("C"); // matches the source's pre-selected state
  const [answeredQuestions, setAnsweredQuestions] = useState(
    new Set([1, 2, 3]),
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showResults, setShowResults] = useState(false);

  function handleSelectOption(optionId) {
    setSelectedOption(optionId);
    setAnsweredQuestions((prev) => new Set(prev).add(4));
  }

  function handleToggleFlag() {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      next.has(4) ? next.delete(4) : next.add(4);
      return next;
    });
  }

  function handleDotClick(num) {
    if (num === 4) return;
    alert(
      `Question ${num}'s content isn't included in this build — only Question 4 was part of the original design.`,
    );
  }

  function handleSubmit() {
    if (answeredQuestions.size < quiz.totalQuestions) return;
    setShowResults(true);
  }

  const canSubmit = answeredQuestions.size === quiz.totalQuestions;

  return (
    <main className="min-h-screen bg-surface font-sans text-ink">
      <nav
        className="border-b border-slate-200 bg-white px-4 py-3 sm:px-8"
        aria-label="Quiz breadcrumb"
      >
        <div className="mx-auto flex max-w-[1440px] items-center gap-3">
          <Link
            to={`/courses/${quiz.courseId}`}
            aria-label="Go back"
            className="rounded-md p-1.5 text-primary hover:bg-primary-light"
          >
            <ArrowLeft size={19} />
          </Link>
          <p className="hidden truncate text-xs font-medium text-slate-500 sm:block">
            {quiz.title} <span className="px-1 text-slate-300">›</span> Section
            1 Quiz
          </p>
        </div>
      </nav>

      <div className="mx-auto max-w-[1440px] space-y-5 p-4 sm:p-8">
        <section
          className="rounded-2xl p-5 text-white shadow-sm sm:px-7"
          style={{
            background:
              "linear-gradient(110deg, rgb(39,106,43), rgb(46,125,50) 60%, rgb(56,142,60))",
          }}
        >
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-gold px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#493700]">
                Section 1 Quiz
              </span>
              <h2 className="mt-2 text-[22px] font-extrabold">{quiz.title}</h2>
              <p className="mt-1 text-xs text-green-50">
                {quiz.totalQuestions} Questions{" "}
                <span className="px-2 text-green-200">•</span>{" "}
                {quiz.timeLimitMinutes} Minutes{" "}
                <span className="px-2 text-green-200">•</span>{" "}
                {quiz.passPercent}% to Pass
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex gap-1.5">
                {Array.from(
                  { length: quiz.totalQuestions },
                  (_, i) => i + 1,
                ).map((num) => {
                  const isCurrent = num === 4;
                  const isAnswered = answeredQuestions.has(num);
                  return (
                    <button
                      key={num}
                      onClick={() => handleDotClick(num)}
                      aria-label={`Question ${num}`}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold ${
                        isCurrent
                          ? "border-gold bg-gold text-[#493700]"
                          : isAnswered
                            ? "border-green-200 bg-green-100 text-primary"
                            : "border-white/30 bg-white/10 text-green-50"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <span className="ml-2 text-xs font-bold text-green-50">
                {answeredQuestions.size} / {quiz.totalQuestions}
              </span>
            </div>
          </div>
        </section>

        <QuestionCard
          question={question4}
          selectedOption={selectedOption}
          onSelectOption={handleSelectOption}
          isFlagged={flaggedQuestions.has(4)}
          onToggleFlag={handleToggleFlag}
        />

        <QuizProgressBar
          answeredCount={answeredQuestions.size}
          totalQuestions={quiz.totalQuestions}
          flaggedCount={flaggedQuestions.size}
          canSubmit={canSubmit}
          onSubmit={handleSubmit}
        />

        {showResults && <QuizResults />}
      </div>
    </main>
  );
}
