import React from "react";

function QuizResult({
  result,
  onContinue,
}) {
  if (!result) {
    return null;
  }

  const {
    score,
    totalPoints,
    percentage,
    passed,
  } = result;

  return (
    <div className="quiz-result">

      <h1>Quiz Result</h1>

      <div>
        <strong>Score</strong>

        <p>
          {score} / {totalPoints}
        </p>
      </div>

      <div>
        <strong>Percentage</strong>

        <p>
          {Number(percentage).toFixed(2)}%
        </p>
      </div>

      <div>
        <strong>Result</strong>

        <p>
          {passed ? "Passed" : "Failed"}
        </p>
      </div>

      {onContinue && (
        <button
          type="button"
          onClick={onContinue}
        >
          Continue
        </button>
      )}

    </div>
  );
}

export default QuizResult;