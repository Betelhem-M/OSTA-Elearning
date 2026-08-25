import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  CheckCircle2,
  PlayCircle,
  Circle,
} from "lucide-react";

export default function ChapterAccordion({
  chapters = [],
  activeLessonId,
  completedLessonIds = new Set(),
}) {
  const [openChapters, setOpenChapters] =
    useState(
      chapters.length > 0
        ? new Set([chapters[0].id])
        : new Set()
    );

  function toggleChapter(id) {
    setOpenChapters((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  return (
    <section
      className="relative w-full rounded-xl border border-slate-100 bg-white"
      style={{
        position: "relative",
        zIndex: 1000,
        pointerEvents: "auto",
      }}
    >
      {chapters.map((chapter) => {
        const isOpen =
          openChapters.has(chapter.id);

        const lessons = Array.isArray(
          chapter.lessons
        )
          ? chapter.lessons
          : [];

        return (
          <div
            key={chapter.id}
            className="border-b border-slate-100 last:border-0"
          >
            <button
              type="button"
              onClick={() =>
                toggleChapter(chapter.id)
              }
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50"
            >
              <ChevronDown
                size={17}
                className={`shrink-0 text-primary transition-transform ${
                  isOpen
                    ? "rotate-180"
                    : ""
                }`}
              />

              <span className="min-w-0 flex-1">
                <strong className="block text-sm text-ink">
                  {chapter.title}
                </strong>

                <span className="mt-0.5 block text-[11px] text-slate-400">
                  {lessons.length}{" "}
                  {lessons.length === 1
                    ? "lesson"
                    : "lessons"}
                </span>
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-slate-100 bg-slate-50/60 p-2">
                {lessons.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-slate-400">
                    No lessons available.
                  </p>
                ) : (
                  lessons.map((lesson) => {
                    const lessonId =
                      Number(lesson.id);

                    const active =
                      lessonId ===
                      Number(activeLessonId);

                    const completed =
                      completedLessonIds.has(
                        lessonId
                      );

                    const published =
                      lesson.is_published ===
                        1 ||
                      lesson.is_published ===
                        true ||
                      lesson.is_published ===
                        "1";

                    if (!published) {
                      return (
                        <div
                          key={lesson.id}
                          className="my-1 flex min-h-[52px] items-center gap-3 rounded-lg px-3 py-2 opacity-50"
                        >
                          <Circle
                            size={16}
                            className="text-slate-300"
                          />

                          <div>
                            <p className="text-[13px] text-ink">
                              {lesson.title}
                            </p>

                            <p className="text-[11px] text-red-400">
                              Unpublished
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={lesson.id}
                        to={`/learn/${lesson.id}`}
                        className={`my-1 flex min-h-[52px] w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-2 transition ${
                          active
                            ? "border-primary bg-primary-light"
                            : "border-transparent hover:bg-white"
                        }`}
                        style={{
                          display: "flex",
                          position: "relative",
                          zIndex: 1001,
                          pointerEvents: "auto",
                          cursor: "pointer",
                        }}
                      >
                        {completed ? (
                          <CheckCircle2
                            size={16}
                            className="shrink-0 text-primary"
                          />
                        ) : active ? (
                          <PlayCircle
                            size={16}
                            className="shrink-0 text-primary"
                          />
                        ) : (
                          <Circle
                            size={16}
                            className="shrink-0 text-slate-300"
                          />
                        )}

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-ink">
                            {lesson.title}
                          </span>

                          <span className="text-[11px] text-slate-400">
                            {lesson.duration_minutes
                              ? `${lesson.duration_minutes} min`
                              : "Lesson"}

                            {active && (
                              <span className="ml-1 font-semibold text-primary">
                                · Now Playing
                              </span>
                            )}
                          </span>
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}

      {chapters.length === 0 && (
        <div className="p-6 text-center text-sm text-slate-400">
          No course sections available.
        </div>
      )}
    </section>
  );
}