import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  UserCheck,
  UserX,
  ClipboardList,
  Send,
  RefreshCw,
} from "lucide-react";

import PerformanceChart from "@components/dashboard/PerformanceChart";
import { apiRequest } from "@services/api";

export default function AdminReports() {
  const [reports, setReports] = useState({
    users: {
      total: 0,
      byRole: {
        student: 0,
        instructor: 0,
        admin: 0,
      },
      byStatus: {
        active: 0,
        suspended: 0,
      },
    },

    courses: {
      total: 0,
      published: 0,
      draft: 0,
    },

    enrollments: {
      total: 0,
      last7Days: [],
    },

    assignments: {
      total: 0,
    },

    submissions: {
      total: 0,
      byStatus: {},
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD REPORTS
  // =====================================================

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("osta_token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const data = await apiRequest("/admin/reports", {
        token,
      });

      setReports({
        users: {
          total: Number(data?.users?.total) || 0,

          byRole: {
            student:
              Number(data?.users?.byRole?.student) || 0,

            instructor:
              Number(data?.users?.byRole?.instructor) || 0,

            admin:
              Number(data?.users?.byRole?.admin) || 0,
          },

          byStatus: {
            active:
              Number(data?.users?.byStatus?.active) || 0,

            suspended:
              Number(data?.users?.byStatus?.suspended) || 0,
          },
        },

        courses: {
          total:
            Number(data?.courses?.total) || 0,

          published:
            Number(data?.courses?.published) || 0,

          draft:
            Number(data?.courses?.draft) || 0,
        },

        enrollments: {
          total:
            Number(data?.enrollments?.total) || 0,

          last7Days: Array.isArray(
            data?.enrollments?.last7Days
          )
            ? data.enrollments.last7Days
            : [],
        },

        assignments: {
          total:
            Number(data?.assignments?.total) || 0,
        },

        submissions: {
          total:
            Number(data?.submissions?.total) || 0,

          byStatus:
            data?.submissions?.byStatus || {},
        },
      });
    } catch (err) {
      console.error("Admin reports error:", err);

      setError(
        err.message || "Failed to load reports."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadReports();
  }, []);

  // =====================================================
  // FORMAT STATUS
  // =====================================================

  function formatStatus(status) {
    if (!status) {
      return "Unknown";
    }

    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink">
            Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review platform activity and performance.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <p className="text-sm text-slate-500">
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink">
            Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review platform activity and performance.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReports}
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
            onClick={loadReports}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* =================================================
          USER REPORT
      ================================================= */}

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-bold text-ink">
            User Report
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Current platform user distribution.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* STUDENTS */}

          <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Students
                </p>

                <p className="mt-2 text-2xl font-extrabold text-ink">
                  {reports.users.byRole.student.toLocaleString()}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Users size={19} />
              </div>
            </div>
          </div>

          {/* INSTRUCTORS */}

          <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Instructors
                </p>

                <p className="mt-2 text-2xl font-extrabold text-ink">
                  {reports.users.byRole.instructor.toLocaleString()}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                <UserCheck size={19} />
              </div>
            </div>
          </div>

          {/* ADMINS */}

          <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Admins
                </p>

                <p className="mt-2 text-2xl font-extrabold text-ink">
                  {reports.users.byRole.admin.toLocaleString()}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                <UserCheck size={19} />
              </div>
            </div>
          </div>

          {/* SUSPENDED */}

          <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Suspended
                </p>

                <p className="mt-2 text-2xl font-extrabold text-ink">
                  {reports.users.byStatus.suspended.toLocaleString()}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <UserX size={19} />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =================================================
          USER TOTAL
      ================================================= */}

      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">
              Total Platform Users
            </p>

            <p className="mt-2 text-3xl font-extrabold text-ink">
              {reports.users.total.toLocaleString()}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
            <Users size={22} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-primary-light p-4">
            <p className="text-xs font-semibold text-primary">
              Active Accounts
            </p>

            <p className="mt-2 text-xl font-extrabold text-primary">
              {reports.users.byStatus.active.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-xs font-semibold text-red-500">
              Suspended Accounts
            </p>

            <p className="mt-2 text-xl font-extrabold text-red-600">
              {reports.users.byStatus.suspended.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* =================================================
          COURSE REPORT
      ================================================= */}

      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
            <BookOpen size={19} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-ink">
              Course Report
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Current course catalog status.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-400">
              Total Courses
            </p>

            <p className="mt-2 text-2xl font-extrabold text-ink">
              {reports.courses.total.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-primary-light p-4">
            <p className="text-xs font-semibold text-primary">
              Published
            </p>

            <p className="mt-2 text-2xl font-extrabold text-primary">
              {reports.courses.published.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-400">
              Draft
            </p>

            <p className="mt-2 text-2xl font-extrabold text-ink">
              {reports.courses.draft.toLocaleString()}
            </p>
          </div>

        </div>
      </section>

      {/* =================================================
          ENROLLMENTS
      ================================================= */}

      <PerformanceChart
        data={reports.enrollments.last7Days}
        valueKey="enrollments"
        labelKey="day"
        title="Enrollment Activity"
      />

      {/* =================================================
          ASSIGNMENTS + SUBMISSIONS
      ================================================= */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ASSIGNMENTS */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <ClipboardList size={19} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-ink">
                Assignments
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Total assignments on the platform.
              </p>
            </div>
          </div>

          <p className="mt-6 text-3xl font-extrabold text-ink">
            {reports.assignments.total.toLocaleString()}
          </p>

        </section>

        {/* SUBMISSIONS */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Send size={19} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-ink">
                Submissions
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Total student submissions.
              </p>
            </div>
          </div>

          <p className="mt-6 text-3xl font-extrabold text-ink">
            {reports.submissions.total.toLocaleString()}
          </p>

        </section>

      </div>

      {/* =================================================
          SUBMISSION STATUS
      ================================================= */}

      <section className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

        <div className="border-b border-slate-100 p-5">
          <h2 className="text-sm font-bold text-ink">
            Submission Status
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Current submission status breakdown.
          </p>
        </div>

        <div className="p-5">

          {Object.keys(
            reports.submissions.byStatus
          ).length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No submission status data available.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(
                reports.submissions.byStatus
              ).map(([status, count]) => (
                <div
                  key={status}
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <p className="text-xs font-semibold text-slate-400">
                    {formatStatus(status)}
                  </p>

                  <p className="mt-2 text-xl font-extrabold text-ink">
                    {Number(count).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

    </div>
  );
}