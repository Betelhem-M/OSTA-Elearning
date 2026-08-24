import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  CheckCircle,
  FileText,
} from "lucide-react";

import PerformanceChart from "@components/dashboard/PerformanceChart";
import { apiRequest } from "@services/api";

export default function InstructorAnalytics() {
  const [analytics, setAnalytics] = useState({
    summary: {
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      totalStudents: 0,
    },
    coursePerformance: [],
    enrollmentActivity: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("osta_token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const data = await apiRequest("/instructor/analytics", {
        token,
      });

      setAnalytics({
        summary: {
          totalCourses:
            Number(data?.summary?.totalCourses) || 0,

          publishedCourses:
            Number(data?.summary?.publishedCourses) || 0,

          draftCourses:
            Number(data?.summary?.draftCourses) || 0,

          totalStudents:
            Number(data?.summary?.totalStudents) || 0,
        },

        coursePerformance:
          Array.isArray(data?.coursePerformance)
            ? data.coursePerformance
            : [],

        enrollmentActivity:
          Array.isArray(data?.enrollmentActivity)
            ? data.enrollmentActivity
            : [],
      });
    } catch (err) {
      console.error(
        "Instructor analytics error:",
        err
      );

      setError(
        err.message ||
          "Failed to load instructor analytics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const summaryCards = [
    {
      label: "Total Courses",
      value: analytics.summary.totalCourses,
      icon: BookOpen,
    },
    {
      label: "Published Courses",
      value: analytics.summary.publishedCourses,
      icon: CheckCircle,
    },
    {
      label: "Draft Courses",
      value: analytics.summary.draftCourses,
      icon: FileText,
    },
    {
      label: "Total Students",
      value: analytics.summary.totalStudents,
      icon: Users,
    },
  ];

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
        <p className="text-sm text-slate-500">
          Loading instructor analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your courses, students, and enrollment activity.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAnalytics}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadAnalytics}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    {card.label}
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-ink">
                    {card.value.toLocaleString()}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <Icon size={19} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ENROLLMENT CHART */}
      <PerformanceChart
        data={analytics.enrollmentActivity}
        valueKey="enrollments"
        labelKey="day"
        title="Enrollment Activity"
      />

      {/* COURSE PERFORMANCE */}
      <section className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-sm font-bold text-ink">
            Course Performance
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Students enrolled in each of your courses.
          </p>
        </div>

        {analytics.coursePerformance.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-400">
              No course data available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">
                    Course
                  </th>

                  <th className="px-5 py-3">
                    Students
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3">
                    Price
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {analytics.coursePerformance.map(
                  (course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            {course.title}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {course.category_name ||
                              "Uncategorized"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users size={15} />

                          <span>
                            {Number(
                              course.students
                            ) || 0}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            course.status ===
                            "published"
                              ? "bg-primary-light text-primary"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {course.status || "draft"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {Number(course.price || 0).toFixed(
                          2
                        )}{" "}
                        ETB
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}