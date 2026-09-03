import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
  XCircle,
} from "lucide-react";

import { apiRequest } from "@services/api";

export default function QuizPanel({ courseId, lessonId }) {
  // =====================================================
  // STATE
  // =====================================================

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD QUIZ
  // =====================================================

  async function loadQuiz() {
    try {
      setLoading(true);
      setError("");

      // Reset state when lesson changes
      setQuiz(null);
      setAttempt(null);
      setAnswers({});
      setResult(null);

      if (!courseId || !lessonId) {
        throw new Error("Course or lesson information is missing.");
      }

      // -------------------------------------------------
      // 1. Get quizzes belonging to the course
      // -------------------------------------------------

      const quizResponse = await apiRequest(
        `/quizzes/course/${courseId}`
      );

      const quizzes = quizResponse?.data;

      if (!Array.isArray(quizzes)) {
        throw new Error("Invalid quiz list response.");
      }

      // -------------------------------------------------
      // 2. Find the quiz attached to this lesson
      // -------------------------------------------------

      const lessonQuiz = quizzes.find(
        (item) =>
          Number(item.lesson_id) === Number(lessonId)
      );

      if (!lessonQuiz) {
        setQuiz(null);
        return;
      }

      // -------------------------------------------------
      // 3. Get the complete quiz
      //    IMPORTANT:
      //    apiRequest returns the full API response.
      //    The actual quiz is inside response.data.
      // -------------------------------------------------

      const fullQuizResponse = await apiRequest(
        `/quizzes/${lessonQuiz.id}`
      );

      const fullQuiz = fullQuizResponse?.data;

      if (!fullQuiz) {
        throw new Error("Quiz data was not returned.");
      }

      // -------------------------------------------------
      // 4. Normalize questions
      // -------------------------------------------------

      const normalizedQuiz = {
        ...fullQuiz,
        questions: Array.isArray(fullQuiz.questions)
          ? fullQuiz.questions
          : [],
      };

      console.log("Loaded quiz:", normalizedQuiz);
      console.log(
        "Quiz questions:",
        normalizedQuiz.questions
      );

      setQuiz(normalizedQuiz);
    } catch (err) {
      console.error("Load quiz error:", err);

      setError(
        err?.message || "Failed to load quiz."
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
  }, [courseId, lessonId]);

  // =====================================================
  // CALCULATE TOTAL POINTS
  // =====================================================

  const totalPoints = useMemo(() => {
    if (!Array.isArray(quiz?.questions)) {
      return 0;
    }

    return quiz.questions.reduce(
      (total, question) =>
        total + Number(question?.points || 0),
      0
    );
  }, [quiz]);

  // =====================================================
  // START / RESUME QUIZ
  // =====================================================

  async function startQuiz() {
    if (!quiz?.id) {
      setError("Quiz ID is missing.");
      return;
    }

    if (!quiz?.questions?.length) {
      setError(
        "This quiz does not contain any questions yet."
      );
      return;
    }

    try {
      setStarting(true);
      setError("");
      setResult(null);
      setAnswers({});

      // -------------------------------------------------
      // Start or resume attempt
      // -------------------------------------------------

      const response = await apiRequest(
        `/quizzes/${quiz.id}/attempts`,
        {
          method: "POST",
        }
      );

      // Backend:
      // {
      //   success: true,
      //   message: "...",
      //   data: {
      //     attempt,
      //     quiz,
      //     resumed
      //   }
      // }

      const data = response?.data || response;

      if (!data?.attempt?.id) {
        throw new Error(
          "Invalid attempt response from server."
        );
      }

      const currentAttempt = data.attempt;

      setAttempt(currentAttempt);

      // -------------------------------------------------
      // Restore previously saved answers
      // -------------------------------------------------

      try {
        const savedResponse = await apiRequest(
          `/quiz-attempts/${currentAttempt.id}`
        );

        const savedData =
          savedResponse?.data || savedResponse;

        const savedAnswers = Array.isArray(
          savedData?.answers
        )
          ? savedData.answers
          : [];

        const restoredAnswers = {};

        savedAnswers.forEach((answer) => {
          const questionId = Number(
            answer.question_id ??
              answer.questionId
          );

          const optionId = Number(
            answer.selected_option_id ??
              answer.selectedOptionId
          );

          if (
            Number.isFinite(questionId) &&
            Number.isFinite(optionId)
          ) {
            restoredAnswers[questionId] = optionId;
          }
        });

        setAnswers(restoredAnswers);
      } catch (restoreError) {
        // Starting the attempt succeeded, so don't block
        // the quiz if restoring saved answers fails.
        console.warn(
          "Could not restore saved answers:",
          restoreError
        );
      }
    } catch (err) {
      console.error("Start quiz error:", err);

      setError(
        err?.message || "Failed to start quiz."
      );
    } finally {
      setStarting(false);
    }
  }

  // =====================================================
  // SELECT ANSWER
  // =====================================================

  async function selectAnswer(questionId, optionId) {
    if (!attempt?.id) {
      setError("Quiz attempt is not available.");
      return;
    }

    const numericQuestionId = Number(questionId);
    const numericOptionId = Number(optionId);

    if (
      !Number.isFinite(numericQuestionId) ||
      !Number.isFinite(numericOptionId)
    ) {
      setError("Invalid question or option.");
      return;
    }

    // Optimistically update UI
    setAnswers((previous) => ({
      ...previous,
      [numericQuestionId]: numericOptionId,
    }));

    try {
      setSavingAnswer(true);
      setError("");

      await apiRequest(
        `/quiz-attempts/${attempt.id}/answers`,
        {
          method: "PUT",
          body: {
            questionId: numericQuestionId,
            selectedOptionId: numericOptionId,
          },
        }
      );
    } catch (err) {
      console.error("Save answer error:", err);

      setError(
        err?.message || "Failed to save answer."
      );
    } finally {
      setSavingAnswer(false);
    }
  }

  // =====================================================
  // SUBMIT QUIZ
  // =====================================================

  async function submitQuiz() {
    if (!attempt?.id) {
      setError("Quiz attempt is not available.");
      return;
    }

    const totalQuestions =
      quiz?.questions?.length || 0;

    const answeredCount =
      Object.keys(answers).length;

    // Don't allow empty quiz submission
    if (totalQuestions === 0) {
      setError(
        "This quiz does not contain any questions."
      );
      return;
    }

    // Require all questions to be answered
    if (answeredCount < totalQuestions) {
      const remaining =
        totalQuestions - answeredCount;

      setError(
        `Please answer all questions. ${remaining} question${
          remaining === 1 ? "" : "s"
        } remaining.`
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await apiRequest(
        `/quiz-attempts/${attempt.id}/submit`,
        {
          method: "POST",
        }
      );

      // Backend:
      // {
      //   success: true,
      //   message: "Quiz submitted successfully",
      //   data: {
      //     attempt,
      //     score,
      //     totalPoints,
      //     percentage,
      //     passed
      //   }
      // }

      const data = response?.data || response;

      if (!data?.attempt) {
        throw new Error(
          "Invalid quiz result response."
        );
      }

      setResult(data);
      setAttempt(data.attempt);
    } catch (err) {
      console.error("Submit quiz error:", err);

      setError(
        err?.message || "Failed to submit quiz."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2
            size={28}
            className="animate-spin text-primary"
          />

          <p className="text-sm font-medium text-slate-600">
            Loading quiz...
          </p>

          <p className="text-xs text-slate-400">
            Preparing your lesson assessment
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR WITHOUT QUIZ
  // =====================================================

  if (error && !quiz) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <XCircle
            size={36}
            className="mx-auto text-red-500"
          />

          <h3 className="mt-3 text-base font-bold text-slate-900">
            Unable to load quiz
          </h3>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadQuiz}
            className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO QUIZ
  // =====================================================

  if (!quiz) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Clock3
              size={22}
              className="text-slate-500"
            />
          </div>

          <h3 className="mt-4 text-base font-bold text-slate-900">
            No quiz available
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            There is currently no quiz attached to this
            lesson.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // QUIZ RESULT
  // =====================================================

  if (result) {
    const passed = Boolean(result.passed);

    const percentage = Number(
      result.percentage || 0
    );

    const score = Number(result.score || 0);

    const resultTotalPoints = Number(
      result.totalPoints ?? totalPoints
    );

    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div
            className={`p-8 text-center ${
              passed
                ? "bg-green-50"
                : "bg-red-50"
            }`}
          >
            {passed ? (
              <CheckCircle2
                size={52}
                className="mx-auto text-green-500"
              />
            ) : (
              <XCircle
                size={52}
                className="mx-auto text-red-500"
              />
            )}

            <h3 className="mt-4 text-2xl font-bold text-slate-900">
              {passed
                ? "Quiz Passed!"
                : "Quiz Not Passed"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {passed
                ? "Great work! You successfully completed this assessment."
                : "Keep practicing and try the quiz again."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Score
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {score}
                <span className="text-base font-medium text-slate-400">
                  {" "}
                  / {resultTotalPoints}
                </span>
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Percentage
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {percentage}%
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Passing Score
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {Number(quiz.pass_percent || 0)}%
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 p-6 text-center">
            <button
              type="button"
              onClick={startQuiz}
              disabled={starting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {starting && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {starting
                ? "Starting..."
                : "Retake Quiz"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // QUIZ INTRO / START SCREEN
  // =====================================================

  if (!attempt) {
    const questionCount =
      quiz.questions?.length || 0;

    const hasQuestions = questionCount > 0;

    return (
      <div className="p-6">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Lesson Quiz
                </div>

                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  {quiz.title}
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {quiz.description ||
                    "Test what you learned in this lesson."}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
                <Clock3
                  size={15}
                  className="text-slate-400"
                />

                {Number(
                  quiz.time_limit_minutes || 0
                )}{" "}
                min
              </div>
            </div>
          </div>

          {/* Quiz information */}
          <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Questions
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {questionCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Passing Score
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {Number(quiz.pass_percent || 0)}%
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Total Points
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {totalPoints}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <XCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <p className="text-sm leading-6 text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Start */}
          <div className="border-t border-slate-200 p-6 sm:p-8">
            <button
              type="button"
              onClick={startQuiz}
              disabled={
                starting || !hasQuestions
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {starting && (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {starting
                ? "Starting Quiz..."
                : "Start Quiz"}
            </button>

            {!hasQuestions && (
              <p className="mt-3 text-xs text-amber-600">
                This quiz has no questions yet.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ACTIVE QUIZ
  // =====================================================

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        {/* Quiz header */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Active Quiz
              </div>

              <h3 className="mt-2 text-xl font-bold text-slate-900">
                {quiz.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Answer every question before submitting.
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-slate-400">
                  Progress
                </span>

                <span className="ml-2 font-bold text-slate-900">
                  {Object.keys(answers).length}/
                  {quiz.questions.length}
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-slate-400">
                  Points
                </span>

                <span className="ml-2 font-bold text-slate-900">
                  {totalPoints}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <XCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <p className="text-sm leading-6 text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-5">
          {quiz.questions.map(
            (question, index) => {
              const selectedOptionId =
                answers[Number(question.id)];

              return (
                <section
                  key={question.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Question */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold leading-6 text-slate-900">
                            {question.prompt}
                          </h4>

                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                            {Number(
                              question.points || 0
                            )}{" "}
                            pt
                          </span>
                        </div>

                        {/* Code */}
                        {question.code && (
                          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-6 text-slate-100">
                            {question.code}
                          </pre>
                        )}

                        {/* Options */}
                        <div className="mt-5 space-y-3">
                          {(question.options || []).map(
                            (option) => {
                              const isSelected =
                                Number(
                                  selectedOptionId
                                ) ===
                                Number(option.id);

                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() =>
                                    selectAnswer(
                                      question.id,
                                      option.id
                                    )
                                  }
                                  className={`group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                                    isSelected
                                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                  }`}
                                >
                                  <span
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition ${
                                      isSelected
                                        ? "border-primary bg-primary text-white"
                                        : "border-slate-300 bg-white text-slate-600 group-hover:border-slate-400"
                                    }`}
                                  >
                                    {option.option_key}
                                  </span>

                                  <span
                                    className={`text-sm leading-6 ${
                                      isSelected
                                        ? "font-semibold text-slate-900"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    {option.option_text}
                                  </span>
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            }
          )}
        </div>

        {/* Saving */}
        {savingAnswer && (
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Loader2
              size={13}
              className="animate-spin"
            />

            Saving answer...
          </div>
        )}

        {/* Submit */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Ready to submit?
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {Object.keys(answers).length} of{" "}
              {quiz.questions.length} questions answered.
            </p>
          </div>

          <button
            type="button"
            onClick={submitQuiz}
            disabled={
              submitting ||
              savingAnswer ||
              Object.keys(answers).length <
                quiz.questions.length
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Send size={16} />
            )}

            {submitting
              ? "Submitting..."
              : "Submit Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}