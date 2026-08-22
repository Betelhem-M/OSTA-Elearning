import { useState, useMemo } from "react";
import { Search, Pencil, Trash2, MoreVertical } from "lucide-react";

export default function CourseManagementTable({ courses: initialCourses }) {
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter((c) => c.title.toLowerCase().includes(q));
  }, [courses, search]);

  function handleDelete(course) {
    if (window.confirm(`Remove "${course.title}" from your course list?`)) {
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    }
  }

  function handleEdit(course) {
    alert(
      `A course editor for "${course.title}" isn't included in this build yet.`,
    );
  }

  function handleMore(course) {
    alert(
      "Additional actions (duplicate, archive, view analytics) aren't included in this build yet.",
    );
  }

  return (
    <section className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
        <h2 className="text-sm font-bold text-ink">My Courses</h2>
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your courses..."
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Course</th>
              <th className="px-5 py-3">Students</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Last Updated</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((course) => (
              <tr key={course.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-3 font-semibold text-ink">
                  {course.title}
                </td>
                <td className="px-5 py-3 text-slate-600">{course.students}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      course.status === "Published"
                        ? "bg-primary-light text-primary"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {course.lastUpdated}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => handleEdit(course)}
                      aria-label={`Edit ${course.title}`}
                      className="rounded-md p-2 text-slate-400 hover:bg-primary-light hover:text-primary"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(course)}
                      aria-label={`Delete ${course.title}`}
                      className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={() => handleMore(course)}
                      aria-label={`More actions for ${course.title}`}
                      className="rounded-md p-2 text-slate-400 hover:bg-slate-100"
                    >
                      <MoreVertical size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-sm text-slate-400"
                >
                  No courses match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
