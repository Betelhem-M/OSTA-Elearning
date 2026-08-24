import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import StatCard from "@components/dashboard/StatCard";
import CourseManagementTable from "@components/dashboard/CourseManagementTable";
import PerformanceChart from "@components/dashboard/PerformanceChart";

import { apiRequest } from "@services/api";

export default function InstructorDashboard() {
  const [stats, setStats] = useState({
    activeCourses: 0,
    totalCourses: 0,
    totalStudents: 0,
    revenue: 0,
  });

  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [enrollmentActivity, setEnrollmentActivity] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("osta_token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const data = await apiRequest("/instructor/dashboard", {
        token,
      });

      setStats({
        activeCourses: Number(data?.stats?.activeCourses) || 0,
        totalCourses: Number(data?.stats?.totalCourses) || 0,
        totalStudents: Number(data?.stats?.totalStudents) || 0,
        revenue: Number(data?.stats?.revenue) || 0,
      });

      setRecentSubmissions(
        Array.isArray(data?.recentSubmissions)
          ? data.recentSubmissions
          : []
      );

      setEnrollmentActivity(
        Array.isArray(data?.enrollmentActivity)
          ? data.enrollmentActivity
          : []
      );
    } catch (err) {
      console.error("Instructor dashboard error:", err);

      setError(
        err.message || "Failed to load instructor dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const instructorStats = [
    {
      icon: "BookOpen",
      label: "Active Courses",
      value: stats.activeCourses,
    },
    {
      icon: "Users",
      label: "Total Students",
      value: stats.totalStudents.toLocaleString(),
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
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink">
            Instructor Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your courses and track student progress.
          </p>
        </div>

        <Link
          to="/instructor/courses/create"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover"
        >
          + Create Course
        </Link>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <p className="text-sm text-slate-500">
            Loading instructor dashboard...
          </p>
        </div>
      ) : (
        <>
          {/* STATS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {instructorStats.map((stat) => (
              <StatCard
                key={stat.label}
                {...stat}
              />
            ))}
          </div>

          {/* COURSES + SUBMISSIONS */}
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            {/* MY COURSES */}
            <CourseManagementTable />

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
                  {recentSubmissions.map((sub) => (
                    <li
                      key={sub.id}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                        {(sub.student || "Student")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-ink">
                          {sub.student || "Unknown student"}
                        </p>

                        <p className="truncate text-[11px] text-slate-400">
                          {sub.assignment || "Assignment"}
                        </p>
                      </div>

                      <span className="shrink-0 text-[11px] text-slate-400">
                        {sub.submittedAgo || ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* IMPORTANT: Instructor route */}
              <Link
                to="/instructor/assignments"
                className="mt-4 block text-xs font-bold text-primary hover:underline"
              >
                View all submissions
              </Link>
            </section>
          </div>

          {/* ENROLLMENTS */}
          <PerformanceChart
            data={enrollmentActivity}
            valueKey="enrollments"
            labelKey="day"
            title="Weekly Enrollments"
          />
        </>
      )}
    </div>
  );
}