import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  BookOpen,
  GraduationCap,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { apiRequest } from "@services/api";

export default function StudentProgress() {
  const { studentId } = useParams();

  const [student, setStudent] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD STUDENT PROGRESS
  // =====================================================

  const loadStudentProgress = useCallback(async () => {
    if (!studentId) {
      setError("Student ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("osta_token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      /*
       * IMPORTANT:
       * Ask the backend for THIS student's progress.
       *
       * Expected endpoint:
       *
       * GET /api/instructor/students/:studentId/progress
       */

      const response = await apiRequest(
        `/instructor/students/${studentId}/progress`,
        {
          token,
        }
      );

      console.log(
        "Student progress response:",
        response
      );

      /*
       * Support several possible backend response shapes.
       */

      const studentData =
        response?.student || null;

      const progressData =
        response?.progress ||
        response?.courses ||
        response?.data ||
        [];

      /*
       * Student information
       */

      if (studentData) {
        setStudent({
          id: studentData.id,
          name:
            studentData.name ||
            `${studentData.first_name || ""} ${
              studentData.last_name || ""
            }`.trim(),
          email: studentData.email || "",
        });
      } else {
        /*
         * If backend puts student information
         * inside the progress records.
         */

        const first =
          Array.isArray(progressData)
            ? progressData[0]
            : null;

        if (first) {
          setStudent({
            id:
              first.studentId ||
              first.student_id ||
              studentId,

            name:
              first.studentName ||
              first.student_name ||
              first.name ||
              "Student",

            email:
              first.studentEmail ||
              first.student_email ||
              first.email ||
              "",
          });
        } else {
          setStudent({
            id: studentId,
            name: "Student",
            email: "",
          });
        }
      }

      /*
       * Normalize progress.
       */

      const normalizedProgress = Array.isArray(
        progressData
      )
        ? progressData.map((course) => ({
            courseId:
              course.courseId ??
              course.course_id,

            courseTitle:
              course.courseTitle ??
              course.course_title ??
              course.title ??
              "Untitled Course",

            totalLessons:
              Number(
                course.totalLessons ??
                  course.total_lessons ??
                  0
              ),

            completedLessons:
              Number(
                course.completedLessons ??
                  course.completed_lessons ??
                  0
              ),
          }))
        : [];

      setProgress(normalizedProgress);
    } catch (err) {
      console.error(
        "Load student progress error:",
        err
      );

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to load student progress."
      );

      setStudent(null);
      setProgress([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadStudentProgress();
  }, [loadStudentProgress]);

  // =====================================================
  // CALCULATE OVERALL PROGRESS
  // =====================================================

  const statistics = useMemo(() => {
    const totalLessons = progress.reduce(
      (sum, course) =>
        sum + Number(course.totalLessons || 0),
      0
    );

    const completedLessons = progress.reduce(
      (sum, course) =>
        sum + Number(course.completedLessons || 0),
      0
    );

    const remainingLessons = Math.max(
      totalLessons - completedLessons,
      0
    );

    const overallProgress =
      totalLessons > 0
        ? Math.round(
            (completedLessons / totalLessons) *
              100
          )
        : 0;

    return {
      totalLessons,
      completedLessons,
      remainingLessons,
      overallProgress,
    };
  }, [progress]);

  // =====================================================
  // INITIALS
  // =====================================================

  const initials = useMemo(() => {
    if (!student?.name) {
      return "ST";
    }

    return student.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [student]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink">
            Student Progress
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Loading student progress...
          </p>
        </div>

        <section className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <RefreshCw
            size={24}
            className="mx-auto animate-spin text-primary"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading...
          </p>
        </section>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="space-y-6">
        <Link
          to="/instructor/students"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <ArrowLeft size={14} />
          Back to Students
        </Link>

        <section className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <AlertCircle
            size={32}
            className="mx-auto text-red-400"
          />

          <p className="mt-4 text-sm font-semibold text-red-500">
            {error}
          </p>

          <button
            type="button"
            onClick={loadStudentProgress}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover"
          >
            <RefreshCw size={15} />
            Try Again
          </button>
        </section>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* BACK */}

      <Link
        to="/instructor/students"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Students
      </Link>

      {/* HEADER */}

      <div>
        <h1 className="mt-3 text-xl font-extrabold text-ink">
          Student Progress
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track student progress across enrolled courses.
        </p>
      </div>

      {/* STUDENT INFO */}

      {student && (
        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex flex-wrap items-center gap-5">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-xl font-extrabold text-primary">
              {initials}
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-ink">
                {student.name}
              </h2>

              {student.email && (
                <p className="text-sm text-slate-500">
                  {student.email}
                </p>
              )}
            </div>

          </div>
        </section>
      )}

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* OVERALL */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <GraduationCap size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Overall Progress
              </p>

              <p className="mt-1 text-2xl font-extrabold text-ink">
                {statistics.overallProgress}%
              </p>
            </div>

          </div>
        </section>

        {/* COURSES */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <BookOpen size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Enrolled Courses
              </p>

              <p className="mt-1 text-2xl font-extrabold text-ink">
                {progress.length}
              </p>
            </div>

          </div>
        </section>

        {/* COMPLETED */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Completed Lessons
              </p>

              <p className="mt-1 text-2xl font-extrabold text-ink">
                {statistics.completedLessons}
              </p>
            </div>

          </div>
        </section>

        {/* REMAINING */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Clock3 size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Remaining Lessons
              </p>

              <p className="mt-1 text-2xl font-extrabold text-ink">
                {statistics.remainingLessons}
              </p>
            </div>

          </div>
        </section>

      </div>

      {/* OVERALL PROGRESS */}

      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-sm font-bold text-ink">
              Overall Course Completion
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Based on completed lessons.
            </p>
          </div>

          <span className="text-xl font-extrabold text-primary">
            {statistics.overallProgress}%
          </span>

        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{
              width: `${statistics.overallProgress}%`,
            }}
          />
        </div>

      </section>

      {/* COURSE PROGRESS */}

      <section className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

        <div className="border-b border-slate-100 p-5">

          <h2 className="text-sm font-bold text-ink">
            Course Progress
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Detailed progress for each enrolled course.
          </p>

        </div>

        <div className="divide-y divide-slate-100">

          {progress.length > 0 ? (
            progress.map((course) => {

              const total =
                Number(course.totalLessons) || 0;

              const completed =
                Number(course.completedLessons) || 0;

              const percentage =
                total > 0
                  ? Math.min(
                      Math.round(
                        (completed / total) * 100
                      ),
                      100
                    )
                  : 0;

              return (
                <div
                  key={course.courseId}
                  className="p-5 transition hover:bg-slate-50/70"
                >

                  <div className="flex flex-wrap items-center justify-between gap-4">

                    <div>
                      <h3 className="font-semibold text-ink">
                        {course.courseTitle}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {completed} of {total} lessons completed
                      </p>
                    </div>

                    <span className="text-lg font-extrabold text-primary">
                      {percentage}%
                    </span>

                  </div>

                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">

                    {percentage === 100 ? (
                      <>
                        <CheckCircle2
                          size={14}
                          className="text-green-600"
                        />

                        <span className="font-semibold text-green-600">
                          Course completed
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock3
                          size={14}
                          className="text-slate-400"
                        />

                        <span>
                          {Math.max(
                            total - completed,
                            0
                          )} lessons remaining
                        </span>
                      </>
                    )}

                  </div>

                </div>
              );
            })
          ) : (
            <div className="p-10 text-center">

              <BookOpen
                size={32}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                No course progress available.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                This student hasn't started any lessons yet.
              </p>

            </div>
          )}

        </div>

      </section>

    </div>
  );
}