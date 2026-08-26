import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Pencil,
  Trash2,
  MoreVertical,
  Eye,
  X,
  Save,
  ExternalLink,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

const API_URL =
  "http://localhost:5000/api";

export default function CourseManagementTable() {
  const [courses, setCourses] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [editingCourse, setEditingCourse] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [openMenu, setOpenMenu] =
    useState(null);

  // =====================================================
  // GET TOKEN
  // =====================================================

  function getToken() {
    return localStorage.getItem(
      "osta_token"
    );
  }

  // =====================================================
  // FETCH INSTRUCTOR COURSES
  // =====================================================

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const token =
        getToken();

      if (!token) {
        setError(
          "Your instructor session is not available. Please log in again."
        );
        return;
      }

      const response =
        await fetch(
          `${API_URL}/courses/my-courses`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        response.status ===
        401
      ) {
        setError(
          "Your session is no longer valid. Please log in again."
        );

        return;
      }

      if (
        response.status ===
        403
      ) {
        setError(
          "You do not have permission to access instructor courses."
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch courses"
        );
      }

      setCourses(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Load instructor courses error:",
        err
      );

      setError(
        err.message ||
          "Failed to load courses"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return courses;
      }

      return courses.filter(
        (course) =>
          String(
            course.title ||
              ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            course.category_name ||
              ""
          )
            .toLowerCase()
            .includes(query)
      );
    }, [
      courses,
      search,
    ]);

  // =====================================================
  // DELETE COURSE
  // =====================================================

  async function handleDelete(
    course
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${course.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        getToken();

      if (!token) {
        setError(
          "Your instructor session is not available."
        );
        return;
      }

      setError("");

      const response =
        await fetch(
          `${API_URL}/courses/${course.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        response.status ===
        401
      ) {
        setError(
          "Your session is no longer valid. Please log in again."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete course"
        );
      }

      setCourses(
        (previous) =>
          previous.filter(
            (item) =>
              Number(
                item.id
              ) !==
              Number(
                course.id
              )
          )
      );

      setOpenMenu(null);

      window.alert(
        "Course deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete course error:",
        err
      );

      setError(
        err.message ||
          "Failed to delete course."
      );
    }
  }

  // =====================================================
  // OPEN EDIT
  // =====================================================

  function handleEdit(
    course
  ) {
    setEditingCourse({
      id: course.id,
      title:
        course.title ||
        "",
      description:
        course.description ||
        "",
      longDescription:
        course.long_description ||
        "",
      categoryId:
        course.category_id ||
        "",
      level:
        course.level ||
        "Beginner",
      price:
        course.price ??
        0,
      thumbnailColor:
        course.thumbnail_color ||
        "#2E7D32",
      status:
        course.status ||
        "draft",
    });

    setOpenMenu(null);
  }

  // =====================================================
  // UPDATE COURSE
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
        getToken();

      if (!token) {
        setError(
          "Your instructor session is not available."
        );
        return;
      }

      const response =
        await fetch(
          `${API_URL}/courses/${editingCourse.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
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
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        response.status ===
        401
      ) {
        setError(
          "Your session is no longer valid. Please log in again."
        );
        return;
      }

      if (
        response.status ===
        403
      ) {
        setError(
          "You are not allowed to modify this course."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update course"
        );
      }

      setCourses(
        (previous) =>
          previous.map(
            (course) =>
              Number(
                course.id
              ) ===
              Number(
                editingCourse.id
              )
                ? data.course
                : course
          )
      );

      setEditingCourse(
        null
      );

      window.alert(
        "Course updated successfully."
      );
    } catch (err) {
      console.error(
        "Update course error:",
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
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="rounded-2xl bg-white p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
        <p className="text-sm text-slate-500">
          Loading your instructor courses...
        </p>
      </section>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <section className="rounded-2xl bg-white p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
        <p className="text-sm font-semibold text-red-500">
          {error}
        </p>

        <button
          type="button"
          onClick={
            loadCourses
          }
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover"
        >
          Try Again
        </button>
      </section>
    );
  }

  return (
    <>
      {/* =================================================
          COURSE TABLE
      ================================================= */}

      <section className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-sm font-bold text-ink">
              My Courses
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Courses owned and managed by your instructor account.
            </p>
          </div>

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
                  event.target
                    .value
                )
              }
              placeholder="Search your courses..."
              className="h-9 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

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
                  Last Updated
                </th>

                <th className="px-5 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.map(
                (course) => (
                  <tr
                    key={
                      course.id
                    }
                    className="hover:bg-slate-50/70"
                  >
                    {/* COURSE */}

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-12 shrink-0 rounded-lg"
                          style={{
                            backgroundColor:
                              course.thumbnail_color ||
                              "#2E7D32",
                          }}
                        />

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            {
                              course.title
                            }
                          </p>

                          <p className="text-xs text-slate-400">
                            {course.category_name ||
                              "Uncategorized"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* STUDENTS */}

                    <td className="px-5 py-3 text-slate-600">
                      {course.students ??
                        0}
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-3">
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

                    {/* UPDATED */}

                    <td className="px-5 py-3 text-slate-500">
                      {course.updated_at
                        ? new Date(
                            course.updated_at
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        {/* MANAGE */}

                        <Link
                          to={`/instructor/courses/${course.id}`}
                          aria-label={`Manage ${course.title}`}
                          className="rounded-md p-2 text-slate-400 hover:bg-primary-light hover:text-primary"
                          title="Manage course"
                        >
                          <Eye
                            size={
                              15
                            }
                          />
                        </Link>

                        {/* PUBLIC PREVIEW */}

                        <Link
                          to={`/courses/${course.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open public preview of ${course.title}`}
                          title="Open public preview"
                          className="rounded-md p-2 text-slate-400 hover:bg-primary-light hover:text-primary"
                        >
                          <ExternalLink
                            size={
                              15
                            }
                          />
                        </Link>

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              course
                            )
                          }
                          aria-label={`Edit ${course.title}`}
                          title="Edit course"
                          className="rounded-md p-2 text-slate-400 hover:bg-primary-light hover:text-primary"
                        >
                          <Pencil
                            size={
                              15
                            }
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
                          aria-label={`Delete ${course.title}`}
                          title="Delete course"
                          className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2
                            size={
                              15
                            }
                          />
                        </button>

                        {/* MORE */}

                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu(
                              openMenu ===
                                course.id
                                ? null
                                : course.id
                            )
                          }
                          aria-label={`More actions for ${course.title}`}
                          title="More actions"
                          className="rounded-md p-2 text-slate-400 hover:bg-slate-100"
                        >
                          <MoreVertical
                            size={
                              15
                            }
                          />
                        </button>
                      </div>

                      {/* MORE MENU */}

                      {openMenu ===
                        course.id && (
                        <div className="relative">
                          <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                            <Link
                              to={`/instructor/courses/${course.id}`}
                              onClick={() =>
                                setOpenMenu(
                                  null
                                )
                              }
                              className="block rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              Manage Course
                            </Link>

                            <Link
                              to={`/courses/${course.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                setOpenMenu(
                                  null
                                )
                              }
                              className="block rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              Open Public Preview
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  course
                                )
                              }
                              className="block w-full rounded-md px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              Edit Course
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  course
                                )
                              }
                              className="block w-full rounded-md px-3 py-2 text-left text-xs font-medium text-red-500 hover:bg-red-50"
                            >
                              Delete Course
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              )}

              {filtered.length ===
                0 && (
                <tr>
                  <td
                    colSpan={
                      5
                    }
                    className="px-5 py-8 text-center text-sm text-slate-400"
                  >
                    {search
                      ? "No courses match your search."
                      : "You haven't created any courses yet."}
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
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-ink">
                  Edit Course
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Update your course information.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingCourse(
                    null
                  )
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={
                handleSaveEdit
              }
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Course Title
                </label>

                <input
                  type="text"
                  value={
                    editingCourse.title
                  }
                  onChange={(
                    event
                  ) =>
                    setEditingCourse(
                      {
                        ...editingCourse,
                        title:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Description
                </label>

                <textarea
                  value={
                    editingCourse.description ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    setEditingCourse(
                      {
                        ...editingCourse,
                        description:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                  required
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Long Description
                </label>

                <textarea
                  value={
                    editingCourse.longDescription ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    setEditingCourse(
                      {
                        ...editingCourse,
                        longDescription:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                  rows={5}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

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
                    onChange={(
                      event
                    ) =>
                      setEditingCourse(
                        {
                          ...editingCourse,
                          categoryId:
                            event
                              .target
                              .value,
                        }
                      )
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
                    onChange={(
                      event
                    ) =>
                      setEditingCourse(
                        {
                          ...editingCourse,
                          level:
                            event
                              .target
                              .value,
                        }
                      )
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
                    onChange={(
                      event
                    ) =>
                      setEditingCourse(
                        {
                          ...editingCourse,
                          price:
                            event
                              .target
                              .value,
                        }
                      )
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
                    onChange={(
                      event
                    ) =>
                      setEditingCourse(
                        {
                          ...editingCourse,
                          status:
                            event
                              .target
                              .value,
                        }
                      )
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
                    onChange={(
                      event
                    ) =>
                      setEditingCourse(
                        {
                          ...editingCourse,
                          thumbnailColor:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                    className="h-10 w-16 cursor-pointer rounded border border-slate-200"
                  />

                  <input
                    type="text"
                    value={
                      editingCourse.thumbnailColor
                    }
                    onChange={(
                      event
                    ) =>
                      setEditingCourse(
                        {
                          ...editingCourse,
                          thumbnailColor:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setEditingCourse(
                      null
                    )
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save
                    size={
                      16
                    }
                  />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}