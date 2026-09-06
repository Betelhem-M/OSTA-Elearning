import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  BookOpen,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Loader2,
  Download,
  User,
} from "lucide-react";

import { apiRequest } from "@services/api";

function getToken() {
  return localStorage.getItem("osta_token");
}

function formatDate(value) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAssignmentStatus(assignment) {
  const now = new Date();
  const dueDate = assignment.due_date
    ? new Date(assignment.due_date)
    : null;

  const isPastDue = dueDate && dueDate.getTime() < now.getTime();

  if (assignment.submission_status === "graded") {
    return "graded";
  }

  if (assignment.submission_id) {
    const submittedAt = assignment.submitted_at
      ? new Date(assignment.submitted_at)
      : null;

    const wasLate =
      dueDate &&
      submittedAt &&
      submittedAt.getTime() > dueDate.getTime();

    return wasLate ? "late" : "submitted";
  }

  if (isPastDue) {
    return "overdue";
  }

  return "not_submitted";
}

const STATUS_META = {
  not_submitted: {
    label: "Not Submitted",
    className: "bg-slate-100 text-slate-600",
  },
  submitted: {
    label: "Submitted",
    className: "bg-primary-light text-primary",
  },
  late: {
    label: "Late Submission",
    className: "bg-orange-50 text-orange-600",
  },
  graded: {
    label: "Graded",
    className: "bg-green-50 text-green-600",
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-50 text-red-600",
  },
};

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadAssignments() {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Please log in to view your assignments."
      );
    }

    const response = await apiRequest(
      "/assignments/my",
      { token }
    );

    const list = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : [];

    setAssignments(list);
  }

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        setLoading(true);
        setError("");
        await loadAssignments();
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Load student assignments error:",
          err
        );

        setError(
          err.message ||
            "Failed to load your assignments."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError("");
      await loadAssignments();
    } catch (err) {
      console.error(
        "Refresh student assignments error:",
        err
      );

      setError(
        err.message ||
          "Failed to refresh assignments."
      );
    } finally {
      setRefreshing(false);
    }
  }

  const normalized = useMemo(() => {
    return assignments.map((assignment) => ({
      ...assignment,
      computedStatus: getAssignmentStatus(assignment),
    }));
  }, [assignments]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalized.filter((assignment) => {
      const matchesSearch =
        !query ||
        String(assignment.title || "")
          .toLowerCase()
          .includes(query) ||
        String(assignment.course_title || "")
          .toLowerCase()
          .includes(query);

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;

      return assignment.computedStatus === statusFilter;
    });
  }, [normalized, search, statusFilter]);

  const stats = useMemo(() => {
    const total = normalized.length;

    const notSubmitted = normalized.filter(
      (a) => a.computedStatus === "not_submitted"
    ).length;

    const graded = normalized.filter(
      (a) => a.computedStatus === "graded"
    ).length;

    const overdue = normalized.filter(
      (a) => a.computedStatus === "overdue"
    ).length;

    return { total, notSubmitted, graded, overdue };
  }, [normalized]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-10 lg:px-8">
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            Loading your assignments...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-10 lg:px-8">
        <div className="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle size={26} />
          </div>

          <h2 className="mt-4 text-base font-bold text-slate-800">
            Unable to load assignments
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm text-red-500">
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
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
            <FileText size={22} />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-ink">
              Assignments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Assignments from your enrolled courses.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={15}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* STATS */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">
            Total
          </p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {stats.total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">
            Not Submitted
          </p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {stats.notSubmitted}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">
            Graded
          </p>
          <p className="mt-1 text-2xl font-extrabold text-green-600">
            {stats.graded}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">
            Overdue
          </p>
          <p className="mt-1 text-2xl font-extrabold text-red-600">
            {stats.overdue}
          </p>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All</option>
          <option value="not_submitted">Not Submitted</option>
          <option value="submitted">Submitted</option>
          <option value="late">Late Submission</option>
          <option value="graded">Graded</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* LIST */}
      <div className="mt-6 space-y-3">
        {filtered.map((assignment) => {
          const statusMeta =
            STATUS_META[assignment.computedStatus] ||
            STATUS_META.not_submitted;

          return (
            <Link
              key={assignment.id}
              to={`/assignments/${assignment.id}`}
              className="block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-ink">
                      {assignment.title}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <BookOpen size={13} />
                    {assignment.course_title}
                  </p>

                  {assignment.instructor_name && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <User size={13} />
                      {assignment.instructor_name}
                    </p>
                  )}

                  {assignment.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                      {assignment.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={12} />
                      Due {formatDate(assignment.due_date)}
                    </span>

                    <span>
                      Max: {assignment.points ?? 100} pts
                    </span>

                    {assignment.attachment_name && (
                      <span className="inline-flex items-center gap-1">
                        <Download size={12} />
                        {assignment.attachment_name}
                        {assignment.attachment_size
                          ? ` (${formatFileSize(assignment.attachment_size)})`
                          : ""}
                      </span>
                    )}
                  </div>

                  {assignment.computedStatus === "graded" && (
                    <p className="mt-2 text-xs font-bold text-green-600">
                      <CheckCircle2
                        size={13}
                        className="mr-1 inline"
                      />
                      Score: {assignment.score ?? 0} /{" "}
                      {assignment.points ?? 100}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100">
              <FileText size={25} />
            </div>

            <h3 className="mt-4 text-base font-extrabold text-slate-800">
              {search || statusFilter !== "all"
                ? "No matching assignments"
                : "No assignments yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search || statusFilter !== "all"
                ? "Try changing your search or filter."
                : "Assignments from your enrolled courses will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}