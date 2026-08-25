import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  Play,
  RefreshCw,
  GraduationCap,
} from "lucide-react";

import { apiRequest } from "@services/api";

export default function MyLearning() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD MY LEARNING
  // =====================================================

  async function loadLearning() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("osta_token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const [enrollmentData, progressData] =
        await Promise.all([
          apiRequest("/enrollments/my", {
            token,
          }),

          apiRequest("/progress/my", {
            token,
          }),
        ]);

      const enrollments = Array.isArray(
        enrollmentData
      )
        ? enrollmentData
        : [];

      const progressRows = Array.isArray(
        progressData
      )
        ? progressData
        : [];

      // =================================================
      // BUILD PROGRESS BY COURSE
      // =================================================

      const progressByCourse = {};

      progressRows.forEach((item) => {
        const courseId = Number(
          item.course_id
        );

        if (!courseId) {
          return;
        }

        if (!progressByCourse[courseId]) {
          progressByCourse[courseId] = {
            totalLessons: 0,
            completedLessons: 0,
          };
        }

        progressByCourse[courseId]
          .totalLessons += 1;

        if (item.completed) {
          progressByCourse[courseId]
            .completedLessons += 1;
        }
      });

      // =================================================
      // FORMAT COURSES
      // =================================================

      const formattedCourses =
        enrollments.map((enrollment) => {
          const courseId = Number(
            enrollment.course_id
          );

          const courseProgress =
            progressByCourse[courseId] || {
              totalLessons: 0,
              completedLessons: 0,
            };

          let progress = 0;

          if (
            courseProgress.totalLessons > 0
          ) {
            progress = Math.round(
              (courseProgress.completedLessons /
                courseProgress.totalLessons) *
                100
            );
          }

          if (
            enrollment.status === "completed"
          ) {
            progress = 100;
          }

          return {
            id: courseId,
            enrollmentId:
              enrollment.id,

            title:
              enrollment.course_title ||
              "Untitled Course",

            description:
              enrollment.course_description ||
              "",

            instructor:
              enrollment.instructor_name ||
              "Unknown Instructor",

            category:
              enrollment.category_name ||
              "Uncategorized",

            level:
              enrollment.level ||
              "Beginner",

            thumbnailColor:
              enrollment.thumbnail_color ||
              "#2E7D32",

            progress,

            status:
              enrollment.status ||
              "active",

            enrolledAt:
              enrollment.enrolled_at,
          };
        });

      setCourses(formattedCourses);
    } catch (err) {
      console.error(
        "My learning error:",
        err
      );

      setError(
        err.message ||
          "Failed to load your courses."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadLearning();
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredCourses = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !query ||
        course.title
          .toLowerCase()
          .includes(query) ||
        course.instructor
          .toLowerCase()
          .includes(query) ||
        course.category
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        course.status ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    courses,
    search,
    statusFilter,
  ]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalCourses = courses.length;

  const completedCourses =
    courses.filter(
      (course) =>
        course.status === "completed" ||
        course.progress >= 100
    ).length;

  const activeCourses =
    courses.filter(
      (course) =>
        course.status === "active" &&
        course.progress < 100
    ).length;

  const averageProgress =
    courses.length > 0
      ? Math.round(
          courses.reduce(
            (sum, course) =>
              sum + course.progress,
            0
          ) / courses.length
        )
      : 0;

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return "—";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }

  // =====================================================
  // GET STATUS LABEL
  // =====================================================

  function getStatusLabel(course) {
    if (
      course.status === "completed" ||
      course.progress >= 100
    ) {
      return "Completed";
    }

    if (
      course.status === "dropped"
    ) {
      return "Dropped";
    }

    return "In Progress";
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-xl font-extrabold text-ink">
            My Learning
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track all of your enrolled courses and progress.
          </p>
        </div>

        <section className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <p className="text-sm text-slate-500">
            Loading your learning...
          </p>
        </section>

      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>
          <h1 className="text-xl font-extrabold text-ink">
            My Learning
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track all of your enrolled courses and progress.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLearning}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">

          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadLearning}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>

        </div>
      )}

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Total Courses
              </p>

              <p className="mt-2 text-2xl font-extrabold text-ink">
                {totalCourses}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <BookOpen size={19} />
            </div>

          </div>
        </section>

        {/* ACTIVE */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold text-slate-400">
                In Progress
              </p>

              <p className="mt-2 text-2xl font-extrabold text-ink">
                {activeCourses}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Play size={19} />
            </div>

          </div>
        </section>

        {/* COMPLETED */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Completed
              </p>

              <p className="mt-2 text-2xl font-extrabold text-ink">
                {completedCourses}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <GraduationCap size={19} />
            </div>

          </div>
        </section>

        {/* AVERAGE */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Average Progress
              </p>

              <p className="mt-2 text-2xl font-extrabold text-ink">
                {averageProgress}%
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <BookOpen size={19} />
            </div>

          </div>
        </section>

      </div>

      {/* =================================================
          COURSE LIST
      ================================================= */}

      <section className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

        {/* HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">

          <div>
            <h2 className="text-sm font-bold text-ink">
              My Courses
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filteredCourses.length}{" "}
              {filteredCourses.length === 1
                ? "course"
                : "courses"}{" "}
              shown
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            {/* SEARCH */}

            <div className="relative">

              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search courses..."
                className="h-9 w-60 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none focus:border-primary"
            >
              <option value="All">
                All Courses
              </option>

              <option value="active">
                In Progress
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="dropped">
                Dropped
              </option>
            </select>

          </div>

        </div>

        {/* COURSE CARDS */}

        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">

          {filteredCourses.map(
            (course) => {
              const statusLabel =
                getStatusLabel(
                  course
                );

              const progress =
                Math.min(
                  Math.max(
                    Number(
                      course.progress
                    ) || 0,
                    0
                  ),
                  100
                );

              return (
                <article
                  key={
                    course.enrollmentId
                  }
                  className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_3px_12px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  {/* THUMBNAIL */}

                  <div
                    className="h-28 w-full"
                    style={{
                      backgroundColor:
                        course.thumbnailColor,
                    }}
                  />

                  {/* CONTENT */}

                  <div className="p-4">

                    <div className="flex items-start justify-between gap-2">

                      <div className="min-w-0">

                        <h3 className="line-clamp-2 text-sm font-bold text-ink">
                          {course.title}
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {course.instructor}
                        </p>

                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                          statusLabel ===
                          "Completed"
                            ? "bg-primary-light text-primary"
                            : statusLabel ===
                              "Dropped"
                            ? "bg-red-50 text-red-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {statusLabel}
                      </span>

                    </div>

                    {/* META */}

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">

                      <span>
                        {course.category}
                      </span>

                      <span>
                        {course.level}
                      </span>

                    </div>

                    {/* PROGRESS */}

                    <div className="mt-4">

                      <div className="flex items-center justify-between text-[11px] font-semibold">

                        <span className="text-slate-400">
                          Progress
                        </span>

                        <span className="text-primary">
                          {progress}%
                        </span>

                      </div>

                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* ENROLLED */}

                    <p className="mt-3 text-[10px] text-slate-400">
                      Enrolled{" "}
                      {formatDate(
                        course.enrolledAt
                      )}
                    </p>

                    {/* ACTION */}

                    <Link
                      to={`/courses/${course.id}`}
                      className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-xs font-bold text-white transition hover:bg-primary-hover"
                    >
                      <Play
                        size={14}
                        fill="currentColor"
                      />

                      {progress > 0 &&
                      progress < 100
                        ? "Continue Learning"
                        : progress >=
                          100
                        ? "Review Course"
                        : "Start Learning"}
                    </Link>

                  </div>

                </article>
              );
            }
          )}

          {/* EMPTY */}

          {filteredCourses.length ===
            0 && (
            <div className="col-span-full py-12 text-center">

              <BookOpen
                size={30}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                {search ||
                statusFilter !==
                  "All"
                  ? "No courses match your filters."
                  : "You are not enrolled in any courses yet."}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Explore the course catalog to find something to learn.
              </p>

              {!search &&
                statusFilter ===
                  "All" && (
                  <Link
                    to="/courses"
                    className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover"
                  >
                    Explore Courses
                  </Link>
                )}

            </div>
          )}

        </div>
      </section>

    </div>
  );
}