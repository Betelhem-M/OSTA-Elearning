import { useEffect, useState } from "react";

function calculateTimeLeft(targetDate) {
  if (!targetDate) {
    return {
      expired: false,
      unavailable: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const diffMs =
    new Date(targetDate).getTime() -
    Date.now();

  if (!Number.isFinite(diffMs)) {
    return {
      expired: false,
      unavailable: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  if (diffMs <= 0) {
    return {
      expired: true,
      unavailable: false,
    };
  }

  const totalSeconds = Math.floor(
    diffMs / 1000
  );

  return {
    expired: false,
    unavailable: false,
    days: Math.floor(
      totalSeconds / 86400
    ),
    hours: Math.floor(
      (totalSeconds % 86400) /
        3600
    ),
    minutes: Math.floor(
      (totalSeconds % 3600) /
        60
    ),
    seconds:
      totalSeconds % 60,
  };
}

export default function CountdownTimer({
  targetDate,
}) {
  const [timeLeft, setTimeLeft] =
    useState(() =>
      calculateTimeLeft(
        targetDate
      )
    );

  useEffect(() => {
    setTimeLeft(
      calculateTimeLeft(
        targetDate
      )
    );

    const interval =
      setInterval(() => {
        setTimeLeft(
          calculateTimeLeft(
            targetDate
          )
        );
      }, 1000);

    return () =>
      clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.unavailable) {
    return (
      <span className="text-xs font-semibold text-slate-400">
        Deadline not specified
      </span>
    );
  }

  if (timeLeft.expired) {
    return (
      <span className="text-xs font-bold text-red-500">
        Deadline passed
      </span>
    );
  }

  return (
    <div className="flex gap-2 text-center">
      {[
        ["Days", timeLeft.days],
        ["Hrs", timeLeft.hours],
        ["Min", timeLeft.minutes],
        ["Sec", timeLeft.seconds],
      ].map(
        ([label, value]) => (
          <div
            key={label}
            className="rounded-lg bg-primary px-2.5 py-1.5 text-white"
          >
            <p className="text-sm font-extrabold leading-none">
              {String(
                value
              ).padStart(2, "0")}
            </p>

            <p className="text-[9px] font-medium text-white/70">
              {label}
            </p>
          </div>
        )
      )}
    </div>
  );
}