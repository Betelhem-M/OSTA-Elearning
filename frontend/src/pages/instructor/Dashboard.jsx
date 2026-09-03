import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import StatCard from "@components/dashboard/StatCard";
import CourseManagementTable from "@components/dashboard/CourseManagementTable";
import PerformanceChart from "@components/dashboard/PerformanceChart";
import ConfirmModal from "@components/ConfirmModal";
import { apiRequest } from "@services/api";

export default function InstructorDashboard() {
  // =====================================================
  // DASHBOARD STATE
  // =====================================================

  const [stats, setStats] = useState({
    activeCourses: 0,
    totalCourses: 0,
    totalStudents: 0,
    revenue: 0,
  });

  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [enrollmentActivity, setEnrollmentActivity] = useState([]);

  // =====================================================
  // UI STATE
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // =====================================================
  // DELETE STATE
  // =====================================================

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [courseToDelete, setCourseToDelete] =
    useState(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const token =
          localStorage.getItem("osta_token");

        if (!token) {
          throw new Error(
            "You are not logged in."
          );
        }

        const data = await apiRequest(
          "/instructor/dashboard",
          {
            token,
          }
        );

        // -------------------------------------------------
        // STATS
        // -------------------------------------------------

        setStats({
          activeCourses:
            Number(
              data?.stats?.activeCourses
            ) || 0,

          totalCourses:
            Number(
              data?.stats?.totalCourses
            ) || 0,

          totalStudents:
            Number(
              data?.stats?.totalStudents
            ) || 0,

          revenue:
            Number(
              data?.stats?.revenue
            ) || 0,
        });

        // -------------------------------------------------
        // RECENT SUBMISSIONS
        // -------------------------------------------------

        setRecentSubmissions(
          Array.isArray(
            data?.recentSubmissions
          )
            ? data.recentSubmissions
            : []
        );

        // -------------------------------------------------
        // ENROLLMENT ACTIVITY
        // -------------------------------------------------

        setEnrollmentActivity(
          Array.isArray(
            data?.enrollmentActivity
          )
            ? data.enrollmentActivity
            : []
        );
      } catch (err) {
        console.error(
          "Instructor dashboard error:",
          err
        );

        setError(
          err.message ||
            "Failed to load instructor dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // =====================================================
  // DELETE REQUEST
  // =====================================================

  function handleRequestDelete(course) {
    if (!course) return;

    setSuccessMessage("");
    setError("");

    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  }

  // =====================================================
  // CLOSE DELETE MODAL
  // =====================================================

  function handleCloseDeleteModal() {
    if (isDeleting) return;

    setIsDeleteModalOpen(false);
    setCourseToDelete(null);
  }

  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  async function handleConfirmDelete() {
    if (!courseToDelete || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      setError("");
      setSuccessMessage("");

      const token =
        localStorage.getItem("osta_token");

      if (!token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      const courseId =
        courseToDelete.id ??
        courseToDelete._id;

      if (!courseId) {
        throw new Error(
          "Course ID is missing."
        );
      }

      await apiRequest(
        `/instructor/courses/${courseId}`,
        {
          method: "DELETE",
          token,
        }
      );

      // -------------------------------------------------
      // CLOSE MODAL
      // -------------------------------------------------

      setIsDeleteModalOpen(false);
      setCourseToDelete(null);

      // -------------------------------------------------
      // SUCCESS FEEDBACK
      // -------------------------------------------------

      setSuccessMessage(
        `"${courseToDelete.title || "Course"}" was deleted successfully.`
      );

      // -------------------------------------------------
      // REFRESH DASHBOARD
      // -------------------------------------------------

      await loadDashboard({
        refresh: true,
      });
    } catch (err) {
      console.error(
        "Failed to delete course:",
        err
      );

      // IMPORTANT:
      // No alert() / browser popup.
      // Error is displayed inside the UI.

      setError(
        err.message ||
          "Could not delete the course. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  // =====================================================
  // STAT CARDS
  // =====================================================

  const instructorStats = useMemo(
    () => [
      {
        icon: "BookOpen",
        label: "Active Courses",
        value: stats.activeCourses,
      },
      {
        icon: "Users",
        label: "Total Students",
        value:
          stats.totalStudents.toLocaleString(),
      },
      {
        icon: "BookOpenCheck",
        label: "Total Courses",
        value: stats.totalCourses,
      },
      {
        icon: "DollarSign",
        label: "Revenue",
        value: `${stats.revenue.toFixed(2)} ETB`,
      },
    ],
    [stats]
  );

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-52 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-100" />
          </div>

          <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
            />
          ))}
        </div>

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <RefreshCw
            size={24}
            className="mx-auto animate-spin text-primary"
          />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading instructor dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink">
            Instructor Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your courses and track
            student progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              loadDashboard({
                refresh: true,
              })
            }
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <Link
            to="/instructor/courses/create"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover"
          >
            + Create Course
          </Link>
        </div>
      </div>

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <div className="flex-1">
            <p className="text-sm font-semibold text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadDashboard({
                  refresh: true,
                })
              }
              className="mt-2 text-xs font-bold text-red-600 hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-green-600"
          />

          <p className="text-sm font-semibold text-green-700">
            {successMessage}
          </p>
        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {instructorStats.map((stat) => (
          <StatCard
            key={stat.label}
            {...stat}
          />
        ))}
      </div>

      {/* =================================================
          COURSES + SUBMISSIONS
      ================================================= */}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">

        {/* MY COURSES */}

        <CourseManagementTable
          onDeleteCourse={
            handleRequestDelete
          }
        />

        {/* RECENT SUBMISSIONS */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <h2 className="text-sm font-bold text-ink">
            Recent Submissions
          </h2>

          {recentSubmissions.length === 0 ? (
            <p className="mt-6 text-center text-xs text-slate-400">
              No submissions yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentSubmissions.map(
                (sub) => (
                  <li
                    key={sub.id}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                      {(sub.student ||
                        "Student")
                        .split(" ")
                        .map(
                          (name) =>
                            name[0]
                        )
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-ink">
                        {sub.student ||
                          "Unknown student"}
                      </p>

                      <p className="truncate text-[11px] text-slate-400">
                        {sub.assignment ||
                          "Assignment"}
                      </p>
                    </div>

                    <span className="shrink-0 text-[11px] text-slate-400">
                      {sub.submittedAgo ||
                        ""}
                    </span>
                  </li>
                )
              )}
            </ul>
          )}

          <Link
            to="/instructor/assignments"
            className="mt-4 block text-xs font-bold text-primary hover:underline"
          >
            View all submissions
          </Link>
        </section>
      </div>

      {/* =================================================
          WEEKLY ENROLLMENTS
      ================================================= */}

      <PerformanceChart
        data={enrollmentActivity}
        valueKey="enrollments"
        labelKey="day"
        title="Weekly Enrollments"
      />

      {/* =================================================
          DELETE CONFIRMATION MODAL
      ================================================= */}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={
          handleCloseDeleteModal
        }
        onConfirm={
          handleConfirmDelete
        }
        title="Delete Course?"
        message={
          courseToDelete
            ? `Are you sure you want to delete "${courseToDelete.title}"? All associated lessons, materials, and student progress will be permanently lost. This action cannot be undone.`
            : "Are you sure you want to delete this course?"
        }
        isLoading={isDeleting}
      />
    </div>
  );
}