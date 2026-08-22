import { Link } from "react-router-dom";
import StatCard from "@components/dashboard/StatCard";
import CourseManagementTable from "@components/dashboard/CourseManagementTable";
import PerformanceChart from "@components/dashboard/PerformanceChart";
import {
  instructorStats,
  instructorCourses,
  recentSubmissions,
  enrollmentActivity,
} from "@mocks/instructorData";

export default function InstructorDashboard() {
  function handleCreateCourse() {
    alert("A course-creation flow isn't included in this build yet.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink">
            Instructor Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your courses and track student progress.
          </p>
        </div>
        <button
          onClick={handleCreateCourse}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover"
        >
          + Create Course
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {instructorStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <CourseManagementTable courses={instructorCourses} />

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <h2 className="text-sm font-bold text-ink">Recent Submissions</h2>
          <ul className="mt-4 space-y-3">
            {recentSubmissions.map((sub) => (
              <li key={sub.id} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                  {sub.student
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">
                    {sub.student}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {sub.assignment}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-slate-400">
                  {sub.submittedAgo}
                </span>
              </li>
            ))}
          </ul>
          <Link
            to="/assignments/data-structures-assignment"
            className="mt-4 block text-xs font-bold text-primary hover:underline"
          >
            View all submissions
          </Link>
        </section>
      </div>

      <PerformanceChart
        data={enrollmentActivity}
        valueKey="enrollments"
        title="Weekly Enrollments"
      />
    </div>
  );
}
