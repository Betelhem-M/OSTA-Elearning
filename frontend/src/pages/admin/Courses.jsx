import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Save,
  BookOpen,
  Users,
  RefreshCw,
} from "lucide-react";






import { apiRequest } from "@services/api";
import ConfirmModal from "@components/ConfirmModal";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [editingCourse, setEditingCourse] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // =====================================================
  // LOAD ALL COURSES
  // =====================================================

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "osta_token"
        );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const data =
        await apiRequest(
          "/courses",
          {
            token,
          }
        );

      setCourses(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Admin courses error:",
        err
      );

      setError(
        err.message ||
          "Failed to load course catalog."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadCourses();
  }, []);

  // =====================================================
  // FILTER COURSES
  // =====================================================

  const filteredCourses =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return courses.filter(
        (course) => {
          const matchesSearch =
            !query ||
            course.title
              ?.toLowerCase()
              .includes(query) ||
            course.instructor_name
              ?.toLowerCase()
              .includes(query) ||
            course.category_name
              ?.toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "All" ||
            course.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      courses,
      search,
      statusFilter,
    ]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalStudents =
    courses.reduce(
      (total, course) =>
        total +
        (Number(course.students) ||
          0),
      0
    );

  const publishedCourses =
    courses.filter(
      (course) =>
        course.status ===
        "published"
    ).length;

  const draftCourses =
    courses.filter(
      (course) =>
        course.status !==
        "published"
    ).length;

  // =====================================================
  // OPEN EDIT
  // =====================================================

  function handleEdit(course) {
    setEditingCourse({
      id: course.id,

      title:
        course.title || "",

      description:
        course.description || "",

      longDescription:
        course.long_description ||
        "",

      categoryId:
        course.category_id || "",

      level:
        course.level ||
        "Beginner",

      price:
        course.price ?? 0,

      thumbnailColor:
        course.thumbnail_color ||
        "#2E7D32",

      status:
        course.status ||
        "draft",
    });
  }

  // =====================================================
  // SAVE EDIT
  // =====================================================

  async function handleSaveEdit(
    event
  ) {
    event.preventDefault();

    if (!editingCourse) {
      return;
    }

    try {
      setSaving(true);

      setError("");

      const token =
        localStorage.getItem(
          "osta_token"
        );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const data =
        await apiRequest(
          `/courses/${editingCourse.id}`,
          {
            token,
            method: "PUT",
            body: {
              title:
                editingCourse.title,

              description:
                editingCourse.description,

              longDescription:
                editingCourse.longDescription,

              categoryId:
                editingCourse.categoryId,

              level:
                editingCourse.level,

              price:
                editingCourse.price,

              thumbnailColor:
                editingCourse.thumbnailColor,

              status:
                editingCourse.status,
            },
          }
        );

      const updatedCourse =
        data?.course;

      if (!updatedCourse) {
        throw new Error(
          "Updated course data was not returned."
        );
      }

      setCourses(
        (previous) =>
          previous.map(
            (course) =>
              course.id ===
              editingCourse.id
                ? updatedCourse
                : course
          )
      );

      setEditingCourse(null);
    } catch (err) {
      console.error(
        "Admin update course error:",
        err
      );

      setError(
        err.message ||
          "Failed to update course."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // DELETE
  // =====================================================

  function handleDelete(course) { setCourseToDelete(course); }

  async function confirmDelete() {
    const course = courseToDelete;
    if (!course) return;

    try {
      setDeletingId(course.id);
      setError("");

      const token =
        localStorage.getItem(
          "osta_token"
        );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      await apiRequest(
        `/courses/${course.id}`,
        {
          token,
          method: "DELETE",
        }
      );

      setCourses(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== course.id
          )
      );
    } catch (err) {
      console.error(
        "Admin delete course error:",
        err
      );

      setError(
        err.message ||
          "Failed to delete course."
      );
    } finally {
      setDeletingId(null);
      setCourseToDelete(null);
    }
  }

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
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink">
            Course Catalog
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage all courses on the OSTA platform.
          </p>
        </div>

        <section className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <p className="text-sm text-slate-500">
            Loading course catalog...
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
            Course Catalog
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage every course on the platform.
          </p>
        </div>

        <button
          type="button"
          onClick={loadCourses}
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
            onClick={loadCourses}
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

        {/* TOTAL COURSES */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">
                Total Courses
              </p>

              <p className="mt-2 text-2xl font-extrabold text-ink">
                {courses.length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <BookOpen size={19} />
            </div>
          </div>
        </section>

        {/* PUBLISHED */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">
                Published
              </p>

              <p className="mt-2 text-2xl font-extrabold text-ink">
                {publishedCourses}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <BookOpen size={19} />
            </div>
          </div>
        </section>

        {/* DRAFTS */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">
                Drafts
              </p>

              <p className="mt-2 text-2xl font-extrabold text-ink">
                {draftCourses}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <BookOpen size={19} />
            </div>
          </div>
        </section>

        {/* STUDENTS */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">
                Total Enrollments
              </p>

              <p className="mt-2 text-2xl font-extrabold text-ink">
                {totalStudents.toLocaleString()}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Users size={19} />
            </div>
          </div>
        </section>

      </div>

      {/* =================================================
          COURSE TABLE
      ================================================= */}

      <section className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

        {/* TABLE HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">

          <div>
            <h2 className="text-sm font-bold text-ink">
              All Courses
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
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search courses..."
                className="h-9 w-60 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none focus:border-primary"
            >
              <option value="All">
                All Status
              </option>

              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>
            </select>

          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">

            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400">

                <th className="px-5 py-3">
                  Course
                </th>

                <th className="px-5 py-3">
                  Instructor
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

                <th className="px-5 py-3">
                  Updated
                </th>

                <th className="px-5 py-3 text-right">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredCourses.map(
                (course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-slate-50/70"
                  >

                    {/* COURSE */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">

                        <div
                          className="h-11 w-14 shrink-0 rounded-lg"
                          style={{
                            backgroundColor:
                              course.thumbnail_color ||
                              "#2E7D32",
                          }}
                        />

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            {course.title}
                          </p>

                          <p className="truncate text-xs text-slate-400">
                            {course.category_name ||
                              "Uncategorized"}
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* INSTRUCTOR */}

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-600">
                        {course.instructor_name ||
                          "Unknown Instructor"}
                      </p>
                    </td>

                    {/* STUDENTS */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users size={14} />

                        {Number(
                          course.students
                        ) || 0}
                      </div>
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          course.status ===
                          "published"
                            ? "bg-primary-light text-primary"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {course.status ||
                          "draft"}
                      </span>
                    </td>

                    {/* PRICE */}

                    <td className="px-5 py-4 text-slate-600">
                      {Number(
                        course.price || 0
                      ).toFixed(2)}{" "}
                      ETB
                    </td>

                    {/* UPDATED */}

                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatDate(
                        course.updated_at
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">

                        {/* VIEW */}

                        <Link
                          to={`/courses/${course.id}`}
                          className="rounded-md p-2 text-slate-400 hover:bg-primary-light hover:text-primary"
                          title="View course"
                        >
                          <Eye size={15} />
                        </Link>

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              course
                            )
                          }
                          className="rounded-md p-2 text-slate-400 hover:bg-primary-light hover:text-primary"
                          title="Edit course"
                        >
                          <Pencil
                            size={15}
                          />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              course
                            )
                          }
                          disabled={
                            deletingId ===
                            course.id
                          }
                          className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Delete course"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>

                      </div>
                    </td>

                  </tr>
                )
              )}

              {/* EMPTY */}

              {filteredCourses.length ===
                0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center"
                  >
                    <BookOpen
                      size={28}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-500">
                      {search ||
                      statusFilter !==
                        "All"
                        ? "No courses match your filters."
                        : "No courses found."}
                    </p>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

      </section>

      {/* =================================================
          EDIT MODAL
      ================================================= */}

      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 p-5">

              <div>
                <h2 className="text-lg font-bold text-ink">
                  Edit Course
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Update course information as administrator.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingCourse(
                    null
                  )
                }
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSaveEdit}
              className="space-y-5 p-5"
            >

              {/* TITLE */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Course Title
                </label>

                <input
                  type="text"
                  value={
                    editingCourse.title
                  }
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      title:
                        e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Description
                </label>

                <textarea
                  value={
                    editingCourse.description
                  }
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      description:
                        e.target.value,
                    })
                  }
                  required
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* LONG DESCRIPTION */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Long Description
                </label>

                <textarea
                  value={
                    editingCourse.longDescription
                  }
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      longDescription:
                        e.target.value,
                    })
                  }
                  rows={5}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* CATEGORY + LEVEL */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">
                    Category ID
                  </label>

                  <input
                    type="number"
                    value={
                      editingCourse.categoryId
                    }
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        categoryId:
                          e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">
                    Level
                  </label>

                  <select
                    value={
                      editingCourse.level
                    }
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        level:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    <option value="Beginner">
                      Beginner
                    </option>

                    <option value="Intermediate">
                      Intermediate
                    </option>

                    <option value="Advanced">
                      Advanced
                    </option>
                  </select>
                </div>

              </div>

              {/* PRICE + STATUS */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">
                    Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      editingCourse.price
                    }
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        price:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">
                    Status
                  </label>

                  <select
                    value={
                      editingCourse.status
                    }
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        status:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    <option value="draft">
                      Draft
                    </option>

                    <option value="published">
                      Published
                    </option>
                  </select>
                </div>

              </div>

              {/* COLOR */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Thumbnail Color
                </label>

                <div className="flex items-center gap-3">

                  <input
                    type="color"
                    value={
                      editingCourse.thumbnailColor
                    }
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        thumbnailColor:
                          e.target.value,
                      })
                    }
                    className="h-10 w-16 cursor-pointer rounded border border-slate-200"
                  />

                  <input
                    type="text"
                    value={
                      editingCourse.thumbnailColor
                    }
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        thumbnailColor:
                          e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
                  />

                </div>
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={() =>
                    setEditingCourse(
                      null
                    )
                  }
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={Boolean(courseToDelete)}
        title="Delete course?"
        message={courseToDelete ? `Delete “${courseToDelete.title}”? Related learning data may also be affected.` : ""}
        confirmText={deletingId ? "Deleting..." : "Delete course"}
        onConfirm={confirmDelete}
        onCancel={() => setCourseToDelete(null)}
      />

    </div>
  );
}