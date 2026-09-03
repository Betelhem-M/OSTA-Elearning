import React from "react";

function QuizProgress({
  currentIndex,
  totalQuestions,
  answeredQuestions,
  onQuestionChange,
}) {
  const percentage =
    totalQuestions > 0
      ? Math.round(
          (answeredQuestions /
            totalQuestions) *
            100
        )
      : 0;

  return (
    <div className="quiz-progress">

      <div>
        Question{" "}
        {currentIndex + 1} of{" "}
        {totalQuestions}
      </div>

      <div>
        {answeredQuestions} /{" "}
        {totalQuestions} answered
      </div>

      <div>
        {percentage}%
      </div>

      <div>
        {Array.from(
          {
            length:
              totalQuestions,
          },
          (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() =>
                onQuestionChange(
                  index
                )
              }
            >
              {index + 1}
            </button>
          )
        )}
      </div>

    </div>
  );
}

export default QuizProgress;