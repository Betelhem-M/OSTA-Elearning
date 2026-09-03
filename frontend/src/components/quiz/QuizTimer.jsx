import React, {
  useEffect,
  useState,
} from "react";

function QuizTimer({
  startedAt,
  timeLimitMinutes,
  onTimeExpired,
}) {
  const calculateRemaining =
    () => {
      if (
        !startedAt ||
        !timeLimitMinutes
      ) {
        return 0;
      }

      const start =
        new Date(
          startedAt
        ).getTime();

      const end =
        start +
        Number(
          timeLimitMinutes
        ) *
          60 *
          1000;

      return Math.max(
        0,
        Math.floor(
          (end -
            Date.now()) /
            1000
        )
      );
    };

  const [remaining, setRemaining] =
    useState(
      calculateRemaining()
    );

  useEffect(() => {
    const timer =
      setInterval(() => {
        const seconds =
          calculateRemaining();

        setRemaining(seconds);

        if (seconds <= 0) {
          clearInterval(timer);

          if (onTimeExpired) {
            onTimeExpired();
          }
        }
      }, 1000);

    return () =>
      clearInterval(timer);
  }, [
    startedAt,
    timeLimitMinutes,
  ]);

  const minutes =
    Math.floor(
      remaining / 60
    );

  const seconds =
    remaining % 60;

  return (
    <div className="quiz-timer">
      <strong>
        Time Remaining
      </strong>

      <div>
        {String(
          minutes
        ).padStart(2, "0")}
        :
        {String(
          seconds
        ).padStart(2, "0")}
      </div>
    </div>
  );
}

export default QuizTimer;