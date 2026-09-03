import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  startQuizAttempt,
  getQuizAttempt,
  saveQuizAnswer,
  submitQuizAttempt,
} from "../../services/quizAttemptApi";

/**
 * OSTA E-Learning
 * Student Quiz Taking Page
 *
 * Expected API response:
 *
 * startQuizAttempt()
 * {
 *   data: {
 *     attempt: {...},
 *     quiz: {...}
 *   }
 * }
 *
 * getQuizAttempt()
 * {
 *   data: {
 *     attempt: {...},
 *     quiz: {...},
 *     answers: [...]
 *   }
 * }
 */

function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [timeRemaining, setTimeRemaining] = useState(null);

  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // ============================================================
  // NORMALIZATION HELPERS
  // ============================================================

  const getResponseData = useCallback((response) => {
    return response?.data?.data ?? response?.data ?? {};
  }, []);

  const normalizeQuestions = useCallback((quizData) => {
    if (!quizData) return [];

    const possibleQuestions =
      quizData.questions ||
      quizData.data?.questions ||
      quizData.quiz?.questions ||
      [];

    if (!Array.isArray(possibleQuestions)) {
      return [];
    }

    return possibleQuestions.map((question, index) => ({
      ...question,
      id: question.id ?? question.question_id ?? index + 1,
      question_number:
        question.question_number ??
        question.questionNumber ??
        index + 1,
      prompt:
        question.prompt ||
        question.question_text ||
        question.question ||
        "",
      options: Array.isArray(question.options)
        ? question.options
        : Array.isArray(question.question_options)
          ? question.question_options
          : [],
    }));
  }, []);

  // ============================================================
  // INITIALIZE QUIZ
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const initializeQuiz = async () => {
      if (!quizId) {
        setError("Quiz ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // --------------------------------------------------------
        // Start attempt
        // --------------------------------------------------------

        const startResponse = await startQuizAttempt(quizId);
        const startData = getResponseData(startResponse);

        const startedAttempt =
          startData.attempt ||
          startData.data?.attempt ||
          null;

        const startedQuiz =
          startData.quiz ||
          startData.data?.quiz ||
          null;

        if (!startedAttempt) {
          throw new Error("Quiz attempt could not be created.");
        }

        if (cancelled) return;

        setAttempt(startedAttempt);

        if (startedQuiz) {
          setQuiz(startedQuiz);
          setQuestions(normalizeQuestions(startedQuiz));
        }

        // --------------------------------------------------------
        // Load complete attempt
        // --------------------------------------------------------

        const attemptResponse = await getQuizAttempt(
          startedAttempt.id
        );

        const attemptData = getResponseData(attemptResponse);

        const loadedAttempt =
          attemptData.attempt ||
          attemptData.data?.attempt ||
          startedAttempt;

        const loadedQuiz =
          attemptData.quiz ||
          attemptData.data?.quiz ||
          startedQuiz;

        const loadedAnswers =
          attemptData.answers ||
          attemptData.data?.answers ||
          [];

        if (cancelled) return;

        setAttempt(loadedAttempt);

        if (loadedQuiz) {
          setQuiz(loadedQuiz);
          setQuestions(normalizeQuestions(loadedQuiz));
        }

        // --------------------------------------------------------
        // Restore saved answers
        // --------------------------------------------------------

        const answerMap = {};

        if (Array.isArray(loadedAnswers)) {
          loadedAnswers.forEach((answer) => {
            if (
              answer?.question_id !== undefined &&
              answer?.selected_option_id !== undefined &&
              answer?.selected_option_id !== null
            ) {
              answerMap[answer.question_id] =
                answer.selected_option_id;
            }
          });
        }

        setAnswers(answerMap);

        // --------------------------------------------------------
        // Calculate remaining time
        // --------------------------------------------------------

        const durationMinutes =
          Number(
            loadedQuiz?.time_limit_minutes ??
              startedQuiz?.time_limit_minutes ??
              0
          );

        if (durationMinutes > 0) {
          const startedAt =
            loadedAttempt?.started_at ||
            startedAttempt?.started_at;

          if (startedAt) {
            const startedTime =
              new Date(startedAt).getTime();

            const totalSeconds = durationMinutes * 60;

            const elapsedSeconds = Math.floor(
              (Date.now() - startedTime) / 1000
            );

            const remaining = Math.max(
              0,
              totalSeconds - elapsedSeconds
            );

            setTimeRemaining(remaining);
          } else {
            setTimeRemaining(totalSeconds);
          }
        } else {
          setTimeRemaining(null);
        }
      } catch (err) {
        console.error("Failed to initialize quiz:", err);

        if (!cancelled) {
          const message =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to start quiz.";

          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initializeQuiz();

    return () => {
      cancelled = true;
    };
  }, [
    quizId,
    getResponseData,
    normalizeQuestions,
  ]);

  // ============================================================
  // CURRENT QUESTION
  // ============================================================

  const currentQuestion = useMemo(() => {
    return questions[currentQuestionIndex] || null;
  }, [questions, currentQuestionIndex]);

  // ============================================================
  // ANSWERED COUNT
  // ============================================================

  const answeredCount = useMemo(() => {
    return Object.keys(answers).filter(
      (questionId) =>
        answers[questionId] !== undefined &&
        answers[questionId] !== null &&
        answers[questionId] !== ""
    ).length;
  }, [answers]);

  const totalQuestions = questions.length;

  const progressPercentage = useMemo(() => {
    if (!totalQuestions) return 0;

    return Math.round(
      (answeredCount / totalQuestions) * 100
    );
  }, [answeredCount, totalQuestions]);

  // ============================================================
  // TIMER
  // ============================================================

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) {
      return "--:--";
    }

    const safeSeconds = Math.max(0, seconds);

    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor(
      (safeSeconds % 3600) / 60
    );
    const remainingSeconds = safeSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}:${String(
        remainingSeconds
      ).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const isTimeLow =
    timeRemaining !== null &&
    timeRemaining <= 60;

  // ============================================================
  // AUTO SUBMIT
  // ============================================================

  const handleSubmitQuiz = useCallback(
    async (autoSubmit = false) => {
      if (!attempt?.id || submitting) {
        return;
      }

      try {
        setSubmitting(true);
        setSaveError("");

        const response = await submitQuizAttempt(
          attempt.id
        );

        const data = getResponseData(response);

        const result =
          data.result ||
          data.attempt ||
          data.data?.result ||
          data.data?.attempt ||
          null;

        // --------------------------------------------------------
        // Navigate to result page
        // --------------------------------------------------------

        if (result?.id) {
          navigate(`/quiz-results/${result.id}`, {
            state: {
              result,
              autoSubmitted: autoSubmit,
            },
          });

          return;
        }

        if (attempt?.id) {
          navigate(`/quiz-results/${attempt.id}`, {
            state: {
              result,
              autoSubmitted: autoSubmit,
            },
          });

          return;
        }

        navigate("/student/quizzes");
      } catch (err) {
        console.error("Failed to submit quiz:", err);

        setSaveError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to submit quiz."
        );

        setSubmitting(false);
      }
    },
    [
      attempt,
      submitting,
      getResponseData,
      navigate,
    ]
  );

  useEffect(() => {
    if (
      timeRemaining === null ||
      submitting ||
      loading
    ) {
      return;
    }

    if (timeRemaining <= 0) {
      handleSubmitQuiz(true);
      return;
    }

    const timer = window.setInterval(() => {
      setTimeRemaining((previous) => {
        if (
          previous === null ||
          previous <= 0
        ) {
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    timeRemaining,
    submitting,
    loading,
    handleSubmitQuiz,
  ]);

  // ============================================================
  // SELECT ANSWER
  // ============================================================

  const handleSelectAnswer = async (
    question,
    option
  ) => {
    if (
      !question?.id ||
      !option?.id ||
      submitting
    ) {
      return;
    }

    const questionId = question.id;
    const optionId = option.id;

    // Optimistic UI update
    setAnswers((previous) => ({
      ...previous,
      [questionId]: optionId,
    }));

    setSaveError("");
    setSavingAnswer(true);

    try {
      await saveQuizAnswer(
        attempt.id,
        questionId,
        optionId
      );
    } catch (err) {
      console.error("Failed to save answer:", err);

      setSaveError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save your answer."
      );
    } finally {
      setSavingAnswer(false);
    }
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const goToQuestion = (index) => {
    if (
      index < 0 ||
      index >= totalQuestions
    ) {
      return;
    }

    setCurrentQuestionIndex(index);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(
        (previous) => previous - 1
      );
    }
  };

  const handleNext = () => {
    if (
      currentQuestionIndex <
      totalQuestions - 1
    ) {
      setCurrentQuestionIndex(
        (previous) => previous + 1
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />

            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Preparing your quiz
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Please wait while we load your quiz attempt...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.5 2.7 17a2 2 0 0 0 1.75 3h15.1a2 2 0 0 0 1.75-3L13.7 3.5a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
              Unable to load quiz
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // NO QUESTIONS
  // ============================================================

  if (!quiz || !questions.length) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 6h13" />
                <path d="M8 12h13" />
                <path d="M8 18h13" />
                <path d="M3 6h.01" />
                <path d="M3 12h.01" />
                <path d="M3 18h.01" />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
              No questions available
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              This quiz does not currently contain any questions.
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // OPTION HELPERS
  // ============================================================

  const getOptionLabel = (option, index) => {
    return (
      option?.option_key ||
      option?.key ||
      String.fromCharCode(65 + index)
    );
  };

  const selectedOptionId =
    answers[currentQuestion?.id];

  const isLastQuestion =
    currentQuestionIndex ===
    totalQuestions - 1;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Quiz Information */}

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Quiz
              </p>

              <h1 className="truncate text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                {quiz.title || "Assessment"}
              </h1>
            </div>

            {/* Timer */}

            {timeRemaining !== null && (
              <div
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 sm:px-4 ${
                  isTimeLow
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
                    : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />
                  <path d="M12 7v5l3 2" />
                </svg>

                <div>
                  <p className="hidden text-[10px] font-semibold uppercase tracking-wide sm:block">
                    Time Remaining
                  </p>

                  <p className="font-mono text-sm font-bold sm:text-base">
                    {formatTime(timeRemaining)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Progress */}

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                {answeredCount} of {totalQuestions} answered
              </span>

              <span className="font-bold text-blue-600 dark:text-blue-400">
                {progressPercentage}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* ====================================================
              QUESTION AREA
          ==================================================== */}

          <section>
            {/* Question Card */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {/* Question Header */}

              <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                      Question{" "}
                      {currentQuestionIndex + 1}
                    </span>
                  </div>

                  <span className="text-sm font-medium text-slate-400">
                    {currentQuestionIndex + 1} /{" "}
                    {totalQuestions}
                  </span>
                </div>
              </div>

              {/* Question Body */}

              <div className="px-5 py-6 sm:px-7 sm:py-8">
                <h2 className="text-lg font-semibold leading-8 text-slate-900 dark:text-white sm:text-xl">
                  {currentQuestion.prompt}
                </h2>

                {/* Code */}

                {currentQuestion.code && (
                  <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">
                    <code>
                      {currentQuestion.code}
                    </code>
                  </pre>
                )}

                {/* Options */}

                <div className="mt-7 space-y-3">
                  {currentQuestion.options?.map(
                    (option, index) => {
                      const optionId =
                        option.id;

                      const isSelected =
                        String(
                          selectedOptionId
                        ) ===
                        String(optionId);

                      const optionLabel =
                        getOptionLabel(
                          option,
                          index
                        );

                      return (
                        <button
                          key={optionId}
                          type="button"
                          disabled={
                            savingAnswer ||
                            submitting
                          }
                          onClick={() =>
                            handleSelectAnswer(
                              currentQuestion,
                              option
                            )
                          }
                          className={`group flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/40"
                              : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-700 dark:hover:bg-slate-800"
                          }`}
                        >
                          {/* Option Letter */}

                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-blue-950 dark:group-hover:text-blue-400"
                            }`}
                          >
                            {optionLabel}
                          </span>

                          {/* Option Text */}

                          <span
                            className={`flex-1 pt-1 text-sm leading-6 sm:text-base ${
                              isSelected
                                ? "font-semibold text-blue-900 dark:text-blue-100"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {option.option_text ||
                              option.text ||
                              option.label ||
                              ""}
                          </span>

                          {/* Selected Check */}

                          {isSelected && (
                            <span className="mt-1 text-blue-600 dark:text-blue-400">
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="m5 12 4 4L19 6" />
                              </svg>
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Save Status */}

                <div className="mt-5 min-h-5">
                  {savingAnswer && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                      Saving answer...
                    </div>
                  )}

                  {saveError && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {saveError}
                    </p>
                  )}

                  {!savingAnswer &&
                    !saveError &&
                    selectedOptionId && (
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Answer saved
                      </p>
                    )}
                </div>
              </div>

              {/* Navigation */}

              <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-7">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={
                    currentQuestionIndex === 0 ||
                    submitting
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>

                  <span className="hidden sm:inline">
                    Previous
                  </span>
                </button>

                {!isLastQuestion ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>Next</span>

                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setShowSubmitModal(true)
                    }
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Quiz

                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m5 12 4 4L19 6" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ====================================================
              QUESTION NAVIGATOR
          ==================================================== */}

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Questions
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Select a question to navigate
                </p>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
                  {questions.map(
                    (question, index) => {
                      const answered =
                        answers[question.id] !==
                          undefined &&
                        answers[question.id] !==
                          null &&
                        answers[question.id] !==
                          "";

                      const current =
                        index ===
                        currentQuestionIndex;

                      return (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() =>
                            goToQuestion(index)
                          }
                          className={`relative flex aspect-square items-center justify-center rounded-lg text-xs font-bold transition ${
                            current
                              ? "bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-800"
                              : answered
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          }`}
                          aria-label={`Question ${
                            index + 1
                          }${
                            answered
                              ? ", answered"
                              : ""
                          }`}
                        >
                          {index + 1}

                          {answered &&
                            !current && (
                              <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            )}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Legend */}

                <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="h-3 w-3 rounded bg-blue-600" />
                    Current
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="h-3 w-3 rounded bg-emerald-500" />
                    Answered
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="h-3 w-3 rounded bg-slate-300 dark:bg-slate-700" />
                    Not answered
                  </div>
                </div>

                {/* Submit */}

                <button
                  type="button"
                  onClick={() =>
                    setShowSubmitModal(true)
                  }
                  disabled={submitting}
                  className="mt-5 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ========================================================
          SUBMIT MODAL
      ======================================================== */}

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-quiz-title"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.5 2.7 17a2 2 0 0 0 1.75 3h15.1a2 2 0 0 0 1.75-3L13.7 3.5a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>

            <h2
              id="submit-quiz-title"
              className="mt-5 text-xl font-bold text-slate-900 dark:text-white"
            >
              Submit your quiz?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              You have answered{" "}
              <strong className="text-slate-900 dark:text-white">
                {answeredCount}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-900 dark:text-white">
                {totalQuestions}
              </strong>{" "}
              questions.
            </p>

            {answeredCount <
              totalQuestions && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                You still have{" "}
                <strong>
                  {totalQuestions -
                    answeredCount}
                </strong>{" "}
                unanswered question
                {totalQuestions -
                  answeredCount !==
                1
                  ? "s"
                  : ""}
                .
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowSubmitModal(false)
                }
                disabled={submitting}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Continue Quiz
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSubmitQuiz(false)
                }
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Submitting...
                  </>
                ) : (
                  "Yes, Submit Quiz"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TakeQuiz;