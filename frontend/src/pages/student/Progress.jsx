import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Loader2,
  TrendingUp,
} from "lucide-react";

import api from "../../context/api";

function Progress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/progress/my");

      /*
       * Your backend currently returns the lesson progress
       * records directly.
       */
      const data = response.data;

      setProgress(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load progress:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load your learning progress."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Group lessons by course.
   */
  const courses = useMemo(() => {
    const grouped = {};

    progress.forEach((lesson) => {
      const courseId = lesson.course_id;

      if (!courseId) return;

      if (!grouped[courseId]) {
        grouped[courseId] = {
          courseId,
          courseTitle: `Course ${courseId}`,
          lessons: [],
        };
      }

      grouped[courseId].lessons.push(lesson);
    });

    return Object.values(grouped).map((course) => {
      const lessons = course.lessons;

      const totalLessons = lessons.length;

      const completedLessons = lessons.filter(
        (lesson) => Boolean(lesson.completed)
      ).length;

      const averageProgress =
        totalLessons > 0
          ? Math.round(
              lessons.reduce(
                (total, lesson) =>
                  total +
                  Number(lesson.progress_percent || 0),
                0
              ) / totalLessons
            )
          : 0;

      return {
        ...course,
        totalLessons,
        completedLessons,
        averageProgress,
      };
    });
  }, [progress]);

  const overallProgress = useMemo(() => {
    if (progress.length === 0) return 0;

    return Math.round(
      progress.reduce(
        (total, lesson) =>
          total + Number(lesson.progress_percent || 0),
        0
      ) / progress.length
    );
  }, [progress]);

  const completedLessons = progress.filter(
    (lesson) => Boolean(lesson.completed)
  ).length;

  const totalLessons = progress.length;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="animate-spin" size={22} />
          <span>Loading your progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <BarChart3 size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              My Progress
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track your learning journey and course completion.
            </p>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Overview cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Overall */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <TrendingUp size={20} />
            </div>

            <span className="text-2xl font-bold text-slate-900">
              {overallProgress}%
            </span>
          </div>

          <p className="text-sm font-medium text-slate-500">
            Overall Progress
          </p>
        </div>

        {/* Courses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <BookOpen size={20} />
            </div>

            <span className="text-2xl font-bold text-slate-900">
              {courses.length}
            </span>
          </div>

          <p className="text-sm font-medium text-slate-500">
            Active Courses
          </p>
        </div>

        {/* Completed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={20} />
            </div>

            <span className="text-2xl font-bold text-slate-900">
              {completedLessons}
            </span>
          </div>

          <p className="text-sm font-medium text-slate-500">
            Lessons Completed
          </p>
        </div>

        {/* Remaining */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <Clock3 size={20} />
            </div>

            <span className="text-2xl font-bold text-slate-900">
              {Math.max(totalLessons - completedLessons, 0)}
            </span>
          </div>

          <p className="text-sm font-medium text-slate-500">
            Lessons Remaining
          </p>
        </div>
      </section>

      {/* Overall progress */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Learning Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your overall learning completion.
            </p>
          </div>

          <span className="text-lg font-bold text-green-700">
            {overallProgress}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-green-600 transition-all duration-700"
            style={{
              width: `${overallProgress}%`,
            }}
          />
        </div>
      </section>

      {/* Courses */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Course Progress
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Detailed progress across your enrolled learning.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BookOpen
              className="mx-auto mb-4 text-slate-400"
              size={40}
            />

            <h3 className="font-semibold text-slate-900">
              No progress yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Start a course and complete your first lesson
              to see your progress here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {courses.map((course) => (
              <div
                key={course.courseId}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {course.courseTitle}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {course.completedLessons} of{" "}
                      {course.totalLessons} lessons completed
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-green-100 text-sm font-bold text-green-700">
                    {course.averageProgress}%
                  </div>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-green-600 transition-all duration-700"
                    style={{
                      width: `${course.averageProgress}%`,
                    }}
                  />
                </div>

                {/* Lesson details */}
                <div className="mt-6 space-y-3">
                  {course.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {lesson.completed ? (
                          <CheckCircle2
                            size={18}
                            className="shrink-0 text-green-600"
                          />
                        ) : (
                          <Clock3
                            size={18}
                            className="shrink-0 text-slate-400"
                          />
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {lesson.lesson_title}
                          </p>

                          <p className="text-xs text-slate-500">
                            {lesson.section_title}
                          </p>
                        </div>
                      </div>

                      <span className="ml-3 shrink-0 text-sm font-semibold text-slate-700">
                        {Number(
                          lesson.progress_percent || 0
                        )}
                        %
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Progress;