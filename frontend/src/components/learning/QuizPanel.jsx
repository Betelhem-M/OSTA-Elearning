import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Send,
  XCircle,
} from "lucide-react";

import { apiRequest } from "@services/api";

export default function QuizPanel({
  courseId,
  lessonId,
}) {
  const [quiz, setQuiz] =
    useState(null);

  const [attempt, setAttempt] =
    useState(null);

  const [answers, setAnswers] =
    useState({});

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [savingAnswer, setSavingAnswer] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  async function loadQuiz() {
    try {
      setLoading(true);
      setError("");

     const quizResponse =
  await apiRequest(
    `/quizzes/course/${courseId}`
  );

const quizzes = quizResponse?.data;

if (!Array.isArray(quizzes)) {
  throw new Error(
    "Invalid quiz response."
  );
}

      const lessonQuiz =
        quizzes.find(
          (item) =>
            Number(
              item.lesson_id
            ) ===
            Number(lessonId)
        );

      if (!lessonQuiz) {
        setQuiz(null);
        return;
      }

      const fullQuiz =
        await apiRequest(
          `/quizzes/${lessonQuiz.id}`
        );

      setQuiz({
        ...fullQuiz,
        questions:
          Array.isArray(
            fullQuiz.questions
          )
            ? fullQuiz.questions
            : [],
      });
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

  useEffect(() => {
    if (
      courseId &&
      lessonId
    ) {
      loadQuiz();
    }
  }, [
    courseId,
    lessonId,
  ]);

  const totalPoints =
    useMemo(() => {
      if (!quiz?.questions) {
        return 0;
      }

      return quiz.questions.reduce(
        (
          total,
          question
        ) =>
          total +
          Number(
            question.points ||
              0
          ),
        0
      );
    }, [quiz]);



async function startQuiz() {
  if (!quiz?.id) {
    setError("Quiz ID is missing.");
    return;
  }

  try {
    setError("");
    setResult(null);
    setAnswers({});

    const response = await apiRequest(
      `/quizzes/${quiz.id}/attempts`,
      {
        method: "POST",
      }
    );

    if (!response?.attempt) {
      throw new Error("Invalid attempt response from server.");
    }

    setAttempt(response.attempt);
  } catch (err) {
    console.error("Start quiz error:", err);

    setError(
      err.message || "Failed to start quiz."
    );
  }
}









async function selectAnswer(questionId, optionId) {
  if (!attempt?.id) {
    setError("Quiz attempt is not available.");
    return;
  }

  const numericQuestionId = Number(questionId);
  const numericOptionId = Number(optionId);

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
      err.message || "Failed to save answer."
    );
  } finally {
    setSavingAnswer(false);
  }
}

async function submitQuiz() {
  if (!attempt?.id) {
    setError("Quiz attempt is not available.");
    return;
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz?.questions?.length || 0;

  if (answeredCount < totalQuestions) {
    setError(
      `Please answer all ${totalQuestions} questions before submitting.`
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

    if (!response?.result) {
      throw new Error("Invalid quiz result response.");
    }

    setResult(response.result);
  } catch (err) {
    console.error("Submit quiz error:", err);

    setError(
      err.message || "Failed to submit quiz."
    );
  } finally {
    setSubmitting(false);
  }
}


  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Loading quiz...
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-red-500">
          {error}
        </p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-500">
          No quiz is attached to this lesson.
        </p>
      </div>
    );
  }

  if (result) {
    const passed =
      Boolean(
        result.passed
      );

    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          {passed ? (
            <CheckCircle2
              size={45}
              className="mx-auto text-green-500"
            />
          ) : (
            <XCircle
              size={45}
              className="mx-auto text-red-500"
            />
          )}

          <h3 className="mt-4 text-xl font-bold text-ink">
            {passed
              ? "Quiz Passed!"
              : "Quiz Not Passed"}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Score:{" "}
            {result.score ??
              0}{" "}
            / {totalPoints}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Percentage:{" "}
            {result.percentage ??
              0}
            %
          </p>

          <button
            type="button"
            onClick={
              startQuiz
            }
            className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-ink">
                {quiz.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {quiz.description ||
                  "Test what you learned in this lesson."}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock3
                size={15}
              />

              {quiz.time_limit_minutes ||
                0}{" "}
              min
            </div>
          </div>

          <div className="mt-4 flex gap-4 text-xs text-slate-500">
            <span>
              {quiz.questions.length}{" "}
              questions
            </span>

            <span>
              Pass:{" "}
              {quiz.pass_percent}%
            </span>
          </div>

          <button
            type="button"
            onClick={
              startQuiz
            }
            className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-ink">
          {quiz.title}
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Answer every question and submit your attempt.
        </p>
      </div>

      <div className="space-y-5">
        {quiz.questions.map(
          (
            question,
            index
          ) => (
            <section
              key={
                question.id
              }
              className="rounded-xl border border-slate-200 p-5"
            >
              <h4 className="text-sm font-bold text-ink">
                {index + 1}.{" "}
                {question.prompt}
              </h4>

              {question.code && (
                <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-white">
                  {question.code}
                </pre>
              )}

              <div className="mt-4 space-y-2">
                {(
                  question.options ||
                  []
                ).map(
                  (
                    option
                  ) => {
                    const selected =
                      Number(
                        answers[
                          question.id
                        ]
                      ) ===
                      Number(
                        option.id
                      );

                    return (
                      <button
                        type="button"
                        key={
                          option.id
                        }
                        onClick={() =>
                          selectAnswer(
                            question.id,
                            option.id
                          )
                        }
                        className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm ${
                          selected
                            ? "border-primary bg-primary-light"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
                          {
                            option.option_key
                          }
                        </span>

                        <span>
                          {
                            option.option_text
                          }
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </section>
          )
        )}
      </div>

      {savingAnswer && (
        <p className="mt-3 text-xs text-slate-400">
          Saving answer...
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={
          submitQuiz
        }
        disabled={
          submitting
        }
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        <Send size={15} />

        {submitting
          ? "Submitting..."
          : "Submit Quiz"}
      </button>
    </div>
  );
}