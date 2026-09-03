import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  FileText,
  Users,
  CheckCircle2,
  Clock3,
  AlertCircle,
  RefreshCw,
  Loader2,
  Eye,
  ClipboardCheck,
} from "lucide-react";

import api from "../../context/api";

export default function Assignments() {
  // =====================================================
  // STATE
  // =====================================================

  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD ASSIGNMENTS
  // =====================================================

  const loadAssignments = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/assignments/instructor");

      const data = response.data;

      /*
       * Support different possible backend response shapes:
       *
       * []
       * { assignments: [] }
       * { data: [] }
       */

      let assignmentList = [];

      if (Array.isArray(data)) {
        assignmentList = data;
      } else if (Array.isArray(data?.assignments)) {
        assignmentList = data.assignments;
      } else if (Array.isArray(data?.data)) {
        assignmentList = data.data;
      }

      setAssignments(assignmentList);
    } catch (err) {
      console.error(
        "Load instructor assignments error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load assignments."
      );
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/assignments/instructor"
        );

        if (!mounted) return;

        const data = response.data;

        let assignmentList = [];

        if (Array.isArray(data)) {
          assignmentList = data;
        } else if (Array.isArray(data?.assignments)) {
          assignmentList = data.assignments;
        } else if (Array.isArray(data?.data)) {
          assignmentList = data.data;
        }

        setAssignments(assignmentList);
      } catch (err) {
        if (!mounted) return;

        console.error(
          "Load instructor assignments error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load assignments."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // REFRESH
  // =====================================================

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await loadAssignments();
    } finally {
      setRefreshing(false);
    }
  }

  // =====================================================
  // NORMALIZE ASSIGNMENT
  // =====================================================

  function normalizeAssignment(assignment) {
    const totalSubmissions = Number(
      assignment.totalSubmissions ??
        assignment.submissionCount ??
        assignment.submissions_count ??
        0
    );

    const gradedSubmissions = Number(
      assignment.gradedSubmissions ??
        assignment.gradedCount ??
        assignment.graded_submissions ??
        0
    );

    const pendingSubmissions = Math.max(
      totalSubmissions - gradedSubmissions,
      0
    );

    return {
      ...assignment,

      id:
        assignment.id ??
        assignment.assignment_id,

      title:
        assignment.title ||
        assignment.assignment_title ||
        "Untitled Assignment",

      courseTitle:
        assignment.courseTitle ||
        assignment.course_title ||
        assignment.courseName ||
        assignment.course_name ||
        "Course",

      totalSubmissions,

      gradedSubmissions,

      pendingSubmissions,

      maxScore:
        Number(
          assignment.maxScore ??
            assignment.max_score ??
            100
        ),

      dueDate:
        assignment.dueDate ??
        assignment.due_date ??
        null,
    };
  }

  // =====================================================
  // NORMALIZED ASSIGNMENTS
  // =====================================================

  const normalizedAssignments = useMemo(() => {
    return assignments.map(normalizeAssignment);
  }, [assignments]);

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedAssignments.filter(
      (assignment) => {
        const matchesSearch =
          !query ||
          assignment.title
            .toLowerCase()
            .includes(query) ||
          assignment.courseTitle
            .toLowerCase()
            .includes(query);

        if (!matchesSearch) {
          return false;
        }

        if (statusFilter === "all") {
          return true;
        }

        if (statusFilter === "pending") {
          return assignment.pendingSubmissions > 0;
        }

        if (statusFilter === "graded") {
          return (
            assignment.gradedSubmissions > 0 &&
            assignment.pendingSubmissions === 0
          );
        }

        if (statusFilter === "no-submissions") {
          return assignment.totalSubmissions === 0;
        }

        return true;
      }
    );
  }, [
    normalizedAssignments,
    search,
    statusFilter,
  ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    const totalAssignments =
      normalizedAssignments.length;

    const totalSubmissions =
      normalizedAssignments.reduce(
        (total, assignment) =>
          total + assignment.totalSubmissions,
        0
      );

    const gradedSubmissions =
      normalizedAssignments.reduce(
        (total, assignment) =>
          total + assignment.gradedSubmissions,
        0
      );

    const pendingSubmissions =
      normalizedAssignments.reduce(
        (total, assignment) =>
          total + assignment.pendingSubmissions,
        0
      );

    return {
      totalAssignments,
      totalSubmissions,
      gradedSubmissions,
      pendingSubmissions,
    };
  }, [normalizedAssignments]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return "No due date";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "No due date";
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
  // CHECK DUE DATE
  // =====================================================

  function getDueStatus(dateValue) {
    if (!dateValue) {
      return {
        label: "No due date",
        className:
          "bg-slate-100 text-slate-500",
      };
    }

    const dueDate = new Date(dateValue);
    const now = new Date();

    if (Number.isNaN(dueDate.getTime())) {
      return {
        label: "No due date",
        className:
          "bg-slate-100 text-slate-500",
      };
    }

    if (dueDate < now) {
      return {
        label: "Past due",
        className:
          "bg-red-50 text-red-600",
      };
    }

    const difference =
      dueDate.getTime() - now.getTime();

    const daysRemaining =
      Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      );

    if (daysRemaining <= 2) {
      return {
        label: "Due soon",
        className:
          "bg-orange-50 text-orange-600",
      };
    }

    return {
      label: "Upcoming",
      className:
        "bg-green-50 text-green-600",
    };
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-xl font-extrabold text-ink">
            Assignments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage assignments and evaluate
            student submissions.
          </p>
        </div>

        <section className="flex min-h-[320px] items-center justify-center rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2
              size={20}
              className="animate-spin"
            />

            Loading assignments...
          </div>
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

        <div>
          <h1 className="text-xl font-extrabold text-ink">
            Assignments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage assignments and evaluate
            student submissions.
          </p>
        </div>

        <section className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle size={24} />
          </div>

          <h2 className="mt-4 text-sm font-bold text-slate-800">
            Unable to load assignments
          </h2>

          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover"
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

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>
          <h1 className="text-xl font-extrabold text-ink">
            Assignments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage assignments, submissions,
            grading, and feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* ASSIGNMENTS */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <FileText size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Assignments
              </p>

              <p className="mt-1 text-2xl font-extrabold text-ink">
                {statistics.totalAssignments}
              </p>
            </div>

          </div>

        </section>

        {/* SUBMISSIONS */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Submissions
              </p>

              <p className="mt-1 text-2xl font-extrabold text-ink">
                {statistics.totalSubmissions}
              </p>
            </div>

          </div>

        </section>

        {/* GRADED */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Graded
              </p>

              <p className="mt-1 text-2xl font-extrabold text-ink">
                {statistics.gradedSubmissions}
              </p>
            </div>

          </div>

        </section>

        {/* PENDING */}

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Clock3 size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Awaiting Review
              </p>

              <p className="mt-1 text-2xl font-extrabold text-ink">
                {statistics.pendingSubmissions}
              </p>
            </div>

          </div>

        </section>

      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <section className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">

          <div>
            <h2 className="text-sm font-bold text-ink">
              Assignment Management
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Review student work and manage
              assignment submissions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            {/* SEARCH */}

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
                    event.target.value
                  )
                }
                placeholder="Search assignments..."
                className="h-9 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">
                All
              </option>

              <option value="pending">
                Needs Review
              </option>

              <option value="graded">
                Fully Graded
              </option>

              <option value="no-submissions">
                No Submissions
              </option>
            </select>

          </div>

        </div>

        {/* =================================================
            ASSIGNMENT LIST
        ================================================= */}

        <div className="divide-y divide-slate-100">

          {filteredAssignments.map(
            (assignment) => {
              const dueStatus =
                getDueStatus(
                  assignment.dueDate
                );

              return (
                <div
                  key={assignment.id}
                  className="p-5 transition hover:bg-slate-50/60"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* INFO */}

                    <div className="flex min-w-0 items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                        <FileText size={20} />
                      </div>

                      <div className="min-w-0">

                        <h3 className="truncate text-sm font-bold text-ink">
                          {assignment.title}
                        </h3>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <BookOpen size={13} />
                          {assignment.courseTitle}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${dueStatus.className}`}
                          >
                            {dueStatus.label}
                          </span>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                            Due:{" "}
                            {formatDate(
                              assignment.dueDate
                            )}
                          </span>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                            Max:{" "}
                            {assignment.maxScore}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* SUBMISSION STATS */}

                    <div className="grid grid-cols-3 gap-3 lg:min-w-[360px]">

                      <div className="rounded-xl bg-slate-50 p-3 text-center">

                        <p className="text-lg font-extrabold text-ink">
                          {
                            assignment.totalSubmissions
                          }
                        </p>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Submitted
                        </p>

                      </div>

                      <div className="rounded-xl bg-green-50 p-3 text-center">

                        <p className="text-lg font-extrabold text-green-700">
                          {
                            assignment.gradedSubmissions
                          }
                        </p>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                          Graded
                        </p>

                      </div>

                      <div className="rounded-xl bg-orange-50 p-3 text-center">

                        <p className="text-lg font-extrabold text-orange-700">
                          {
                            assignment.pendingSubmissions
                          }
                        </p>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-600">
                          Pending
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2">

                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                      <Eye size={14} />
                      View Assignment
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-hover"
                    >
                      <ClipboardCheck size={14} />
                      Review Submissions
                    </button>

                  </div>

                </div>
              );
            }
          )}

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {filteredAssignments.length === 0 && (
            <div className="px-5 py-14 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FileText size={25} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-600">
                {search ||
                statusFilter !== "all"
                  ? "No matching assignments"
                  : "No assignments yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                {search ||
                statusFilter !== "all"
                  ? "Try changing your search or filter."
                  : "Assignments created for your courses will appear here."}
              </p>

              {(search ||
                statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 text-xs font-bold text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}

            </div>
          )}

        </div>

      </section>

    </div>
  );
}