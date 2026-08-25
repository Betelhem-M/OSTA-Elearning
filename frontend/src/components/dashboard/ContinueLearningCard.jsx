import { Link } from "react-router-dom";
import { Play } from "lucide-react";

export default function ContinueLearningCard({
  course,
}) {
  if (!course) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-hover p-5 text-white shadow-[0_8px_20px_rgba(46,125,50,0.18)]">

      <div className="flex items-start justify-between gap-3">

        <div className="max-w-[260px]">

          <p className="text-[10px] font-bold uppercase tracking-wide text-white/70">
            Continue Learning
          </p>

          <h3 className="mt-1 text-lg font-extrabold leading-snug">
            {course.title}
          </h3>

          <p className="mt-1 text-xs text-white/80">
            {course.lesson}
          </p>

        </div>

      </div>

      {/* PROGRESS */}

      <div className="mt-4">

        <div className="flex items-center justify-between text-[11px] font-semibold text-white/80">
          <span>
            {Number(
              course.progress
            ) || 0}
            % complete
          </span>

          <span>
            {course.timeLeft ||
              ""}
          </span>
        </div>

        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-gold"
            style={{
              width: `${Math.min(
                Math.max(
                  Number(
                    course.progress
                  ) || 0,
                  0
                ),
                100
              )}%`,
            }}
          />
        </div>

      </div>

      {/* RESUME */}

      <Link
        to={`/learn/${course.id}`}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-bold text-primary transition hover:bg-white/90"
      >
        <Play
          size={16}
          fill="currentColor"
        />

        {Number(course.progress) > 0
          ? "Resume Lesson"
          : "Start Lesson"}
      </Link>

    </div>
  );
}