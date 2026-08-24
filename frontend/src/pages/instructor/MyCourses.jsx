import { Link } from "react-router-dom";
import CourseManagementTable from "@components/dashboard/CourseManagementTable";

export default function MyCourses() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink">
            My Courses
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your courses and track your students.
          </p>
        </div>

        <Link
          to="/instructor/courses/create"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover"
        >
          + Create Course
        </Link>
      </div>

      {/* REAL BACKEND COURSE TABLE */}
      <CourseManagementTable />
    </div>
  );
}