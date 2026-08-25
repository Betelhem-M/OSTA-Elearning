import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Flag,
  Loader2,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import QuestionCard from "@components/quiz/QuestionCard";
import QuizProgressBar from "@components/quiz/QuizProgressBar";
import QuizResults from "@components/quiz/QuizResults";

import { apiRequest } from "@services/api";

export default function Quiz() {
  const { quizId } = useParams();

  const [quiz, setQuiz] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [attempt, setAttempt] =
    useState(null);

  const [answers, setAnswers] =
    useState({});

  const [flaggedQuestions, setFlaggedQuestions] =
    useState(new Set());

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [savingAnswer, setSavingAnswer] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [showResults, setShowResults] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  // =====================================================
  // CURRENT QUESTION
  // =====================================================

  const currentQuestion =
    questions[currentIndex];

  // =====================================================
  // ANSWERED COUNT
  // =====================================================

  const answeredCount =
    useMemo(() => {
      return Object.keys(
        answers
      ).length;
    }, [answers]);

  // =====================================================
  // LOAD QUIZ
  // =====================================================

  async function loadQuiz() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "osta_token"
        );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      // ================================================
      // GET QUIZ
      // ================================================

      const quizData =
        await apiRequest(
          `/quizzes/${quizId}`,
          {
            token,
          }
        );

      const quizQuestions =
        Array.isArray(
          quizData?.questions
        )
          ? quizData.questions
          : [];

      if (
        quizQuestions.length === 0
      ) {
        throw new Error(
          "This quiz does not contain any questions yet."
        );
      }

      setQuiz(quizData);
      setQuestions(
        quizQuestions
      );

      // ================================================
      // START ATTEMPT
      // ================================================

      const attemptResponse =
        await apiRequest(
          `/quizzes/${quizId}/attempts`,
          {
            token,
            method: "POST",
          }
        );

      setAttempt(
        attemptResponse?.attempt ||
          null
      );
    } catch (err) {
      console.error(
        "Load quiz error:",
        err
      );

      setError(
        err.message ||
          "Failed to load quiz."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  // =====================================================
  // SELECT ANSWER
  // =====================================================

  async function handleSelectOption(
    optionId
  ) {
    if (
      !attempt ||
      !currentQuestion ||
      showResults
    ) {
      return;
    }

    const questionId =
      Number(
        currentQuestion.id
      );

    setAnswers(
      (previous) => ({
        ...previous,
        [questionId]:
          Number(optionId),
      })
    );

    try {
      setSavingAnswer(true);
      setError("");

      const token =
        localStorage.getItem(
          "osta_token"
        );

      await apiRequest(
        `/quizzes/attempts/${attempt.id}/answers`,
        {
          token,
          method: "POST",
          body: {
            questionId,
            selectedOptionId:
              Number(optionId),
          },
        }
      );
    } catch (err) {
      console.error(
        "Save quiz answer error:",
        err
      );

      setError(
        err.message ||
          "Failed to save your answer."
      );
    } finally {
      setSavingAnswer(false);
    }
  }

  // =====================================================
  // TOGGLE FLAG
  // =====================================================

  function handleToggleFlag() {
    if (!currentQuestion) {
      return;
    }

    const questionId =
      Number(
        currentQuestion.id
      );

    setFlaggedQuestions(
      (previous) => {
        const next =
          new Set(previous);

        if (
          next.has(questionId)
        ) {
          next.delete(
            questionId
          );
        } else {
          next.add(
            questionId
          );
        }

        return next;
      }
    );
  }

  // =====================================================
  // QUESTION NAVIGATION
  // =====================================================

  function goToQuestion(index) {
    if (
      index < 0 ||
      index >= questions.length
    ) {
      return;
    }

    setCurrentIndex(index);
  }

  // =====================================================
  // SUBMIT QUIZ
  // =====================================================

  async function handleSubmit() {
    if (
      !attempt ||
      questions.length === 0
    ) {
      return;
    }

    if (
      answeredCount !==
      questions.length
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const token =
        localStorage.getItem(
          "osta_token"
        );

      const response =
        await apiRequest(
          `/quizzes/attempts/${attempt.id}/submit`,
          {
            token,
            method: "POST",
          }
        );

      const submittedResult =
        response?.result;

      if (!submittedResult) {
        throw new Error(
          "Quiz submission did not return a result."
        );
      }

      setResult(
        submittedResult
      );

      setShowResults(true);
    } catch (err) {
      console.error(
        "Submit quiz error:",
        err
      );

      setError(
        err.message ||
          "Failed to submit quiz."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-surface font-sans text-ink">
        <div className="mx-auto max-w-[1000px] px-4 py-16">

          <div className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

            <Loader2
              size={24}
              className="mx-auto animate-spin text-primary"
            />

            <p className="mt-3 text-sm text-slate-500">
              Loading quiz...
            </p>

          </div>

        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !quiz) {
    return (
      <main className="min-h-[70vh] bg-surface font-sans text-ink">

        <div className="mx-auto max-w-[600px] px-5 py-16 text-center">

          <h1 className="text-xl font-bold text-ink">
            Quiz could not be loaded
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <Link
            to="/my-learning"
            className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover"
          >
            Back to My Learning
          </Link>

        </div>

      </main>
    );
  }

  // =====================================================
  // RESULTS
  // =====================================================

  if (
    showResults &&
    result
  ) {
    return (
      <main className="min-h-screen bg-surface font-sans text-ink">

        <nav className="border-b border-slate-200 bg-white px-4 py-3 sm:px-8">

          <div className="mx-auto flex max-w-[1200px] items-center gap-3">

            <Link
              to={
                quiz?.course_id
                  ? `/courses/${quiz.course_id}`
                  : "/my-learning"
              }
              aria-label="Go back"
              className="rounded-md p-1.5 text-primary hover:bg-primary-light"
            >
              <ArrowLeft size={19} />
            </Link>

            <p className="truncate text-xs font-medium text-slate-500">
              {quiz?.title}
            </p>

          </div>

        </nav>

        <div className="mx-auto max-w-[1200px] space-y-5 p-4 sm:p-8">

          <QuizResults
            result={result}
            quiz={quiz}
            questions={questions}
            answers={answers}
          />

        </div>
      </main>
    );
  }

  if (!quiz || !currentQuestion) {
    return null;
  }

  const canSubmit =
    answeredCount ===
    questions.length;

  const currentQuestionId =
    Number(
      currentQuestion.id
    );

  const selectedOption =
    answers[
      currentQuestionId
    ] || null;

  const isFlagged =
    flaggedQuestions.has(
      currentQuestionId
    );

  return (
    <main className="min-h-screen bg-surface font-sans text-ink">

      {/* =================================================
          HEADER
      ================================================= */}

      <nav
        className="border-b border-slate-200 bg-white px-4 py-3 sm:px-8"
        aria-label="Quiz breadcrumb"
      >

        <div className="mx-auto flex max-w-[1200px] items-center gap-3">

          <Link
            to={
              quiz.course_id
                ? `/courses/${quiz.course_id}`
                : "/my-learning"
            }
            aria-label="Go back"
            className="rounded-md p-1.5 text-primary hover:bg-primary-light"
          >
            <ArrowLeft size={19} />
          </Link>

          <p className="truncate text-xs font-medium text-slate-500">

            {quiz.title}

            <span className="px-1 text-slate-300">
              ›
            </span>

            Question{" "}
            {currentIndex + 1}
            {" of "}
            {questions.length}

          </p>

        </div>

      </nav>

      <div className="mx-auto max-w-[1200px] space-y-5 p-4 sm:p-8">

        {/* =================================================
            QUIZ HEADER
        ================================================= */}

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
                Quiz
              </span>

              <h2 className="mt-2 text-[22px] font-extrabold">
                {quiz.title}
              </h2>

              <p className="mt-1 text-xs text-green-50">

                {questions.length}{" "}
                Questions

                {quiz.time_limit_minutes && (
                  <>
                    <span className="px-2 text-green-200">
                      •
                    </span>

                    {quiz.time_limit_minutes}{" "}
                    Minutes
                  </>
                )}

                <span className="px-2 text-green-200">
                  •
                </span>

                {quiz.pass_percent}% to Pass

              </p>

            </div>

            {/* QUESTION NUMBERS */}

            <div className="flex flex-wrap items-center gap-1.5">

              <div className="flex flex-wrap gap-1.5">

                {questions.map(
                  (question, index) => {

                    const questionId =
                      Number(
                        question.id
                      );

                    const answered =
                      answers[
                        questionId
                      ] !== undefined;

                    const flagged =
                      flaggedQuestions.has(
                        questionId
                      );

                    const current =
                      index ===
                      currentIndex;

                    return (
                      <button
                        key={
                          question.id
                        }
                        type="button"
                        onClick={() =>
                          goToQuestion(
                            index
                          )
                        }
                        className={`relative flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold ${
                          current
                            ? "border-gold bg-gold text-[#493700]"
                            : answered
                            ? "border-green-200 bg-green-100 text-primary"
                            : "border-white/30 bg-white/10 text-green-50"
                        }`}
                      >
                        {index + 1}

                        {flagged && (
                          <Flag
                            size={8}
                            fill="currentColor"
                            className="absolute -right-0.5 -top-0.5 text-gold"
                          />
                        )}

                      </button>
                    );
                  }
                )}

              </div>

              <span className="ml-2 text-xs font-bold text-green-50">
                {answeredCount} /{" "}
                {questions.length}
              </span>

            </div>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* SAVING */}

        {savingAnswer && (
          <p className="text-right text-[11px] font-medium text-slate-400">
            Saving answer...
          </p>
        )}

        {/* =================================================
            QUESTION
        ================================================= */}

        <QuestionCard
          question={{
            ...currentQuestion,
            number:
              currentIndex + 1,
          }}
          selectedOption={
            selectedOption
          }
          onSelectOption={
            handleSelectOption
          }
          isFlagged={
            isFlagged
          }
          onToggleFlag={
            handleToggleFlag
          }
        />

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="flex items-center justify-between gap-3">

          <button
            type="button"
            onClick={() =>
              goToQuestion(
                currentIndex - 1
              )
            }
            disabled={
              currentIndex === 0
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft
              size={15}
            />
            Previous
          </button>

          <button
            type="button"
            onClick={() =>
              goToQuestion(
                currentIndex + 1
              )
            }
            disabled={
              currentIndex ===
              questions.length - 1
            }
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight
              size={15}
            />
          </button>

        </div>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <QuizProgressBar
          answeredCount={
            answeredCount
          }
          totalQuestions={
            questions.length
          }
          flaggedCount={
            flaggedQuestions.size
          }
          canSubmit={
            canSubmit &&
            !submitting
          }
          onSubmit={
            handleSubmit
          }
        />

      </div>
    </main>
  );
}