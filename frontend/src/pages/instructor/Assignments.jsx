import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Search,
  FileText,
  Users,
  BookOpen,
  CheckCircle2,
  Clock3,
  AlertCircle,
  RefreshCw,
  Loader2,
  Eye,
  ClipboardCheck,
  Plus,
  X,
  Upload,
  Download,
} from "lucide-react";

import api from "../../context/api";
import { downloadAuthenticatedFile } from "@utils/download";

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".zip",
  ".rar",
  ".7z",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

const MAX_ATTACHMENT_SIZE_MB = 30;

function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Assignments() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [assignments, setAssignments] = useState([]);

  const [downloadingAttachmentId, setDownloadingAttachmentId] =
    useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // =====================================================
  // CREATE ASSIGNMENT STATE
  // =====================================================

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [myCourses, setMyCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    courseId: "",
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    points: 100,
    allowedFileTypes: "",
    maxFileSizeMb: 10,
    status: "published",
  });

  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentError, setAttachmentError] = useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // =====================================================
  // LOAD ASSIGNMENTS
  // =====================================================

  const loadAssignments = useCallback(async () => {
    try {
      setError("");

      const response = await api.get(
        "/assignments/instructor"
      );

      const data = response?.data;

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
          err?.message ||
          "Failed to load assignments."
      );
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/assignments/instructor"
        );

        if (cancelled) {
          return;
        }

        const data = response?.data;

        let assignmentList = [];

        if (Array.isArray(data)) {
          assignmentList = data;
        } else if (
          Array.isArray(data?.assignments)
        ) {
          assignmentList = data.assignments;
        } else if (Array.isArray(data?.data)) {
          assignmentList = data.data;
        }

        setAssignments(assignmentList);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load instructor assignments error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load assignments."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
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
  // VIEW ASSIGNMENT (download own attachment, if any)
  // =====================================================

  async function handleViewAssignment(assignment) {
    if (!assignment.attachment_url) {
      setError("This assignment has no attached file to view.");
      return;
    }

    try {
      setDownloadingAttachmentId(assignment.id);

      await downloadAuthenticatedFile(
        assignment.attachment_url,
        assignment.attachment_name || "assignment-file"
      );
    } catch (err) {
      setError(
        err.message || "Failed to download the assignment file."
      );
    } finally {
      setDownloadingAttachmentId(null);
    }
  }

  // =====================================================
  // REVIEW SUBMISSIONS
  // =====================================================

  function handleReviewSubmissions(assignment) {
    navigate(
      `/instructor/assignments/review?assignmentId=${assignment.id}`
    );
  }

  // =====================================================
  // LOAD MY COURSES (for create-assignment dropdown)
  // =====================================================

  const loadMyCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);

      const response = await api.get(
        "/courses/my-courses"
      );

      const data = response?.data;

      if (Array.isArray(data)) {
        setMyCourses(data);
      } else if (Array.isArray(data?.data)) {
        setMyCourses(data.data);
      } else {
        setMyCourses([]);
      }
    } catch (err) {
      console.error(
        "Load my courses error:",
        err
      );
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  // =====================================================
  // CREATE MODAL HANDLERS
  // =====================================================

  function openCreateModal() {
    setCreateError("");
    setAttachmentFile(null);
    setAttachmentError("");

    setCreateForm({
      courseId: "",
      title: "",
      description: "",
      instructions: "",
      dueDate: "",
      points: 100,
      allowedFileTypes: "",
      maxFileSizeMb: 10,
      status: "published",
    });

    setShowCreateModal(true);

    if (myCourses.length === 0) {
      loadMyCourses();
    }
  }

  function closeCreateModal() {
    if (creating) return;
    setShowCreateModal(false);
  }

  function handleCreateChange(event) {
    const { name, value } = event.target;

    setCreateForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (createError) {
      setCreateError("");
    }
  }

  // =====================================================
  // ATTACHMENT HANDLERS
  // =====================================================

  function handleAttachmentChange(event) {
    const file = event.target.files?.[0];

    // Allow re-selecting the exact same file later.
    event.target.value = "";

    if (!file) {
      return;
    }

    const nameParts = file.name.split(".");

    const extension =
      nameParts.length > 1
        ? `.${nameParts.pop().toLowerCase()}`
        : "";

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setAttachmentError(
        `"${extension || "unknown"}" files are not supported. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`
      );
      return;
    }

    if (
      file.size >
      MAX_ATTACHMENT_SIZE_MB * 1024 * 1024
    ) {
      setAttachmentError(
        `File is too large. Maximum size is ${MAX_ATTACHMENT_SIZE_MB} MB.`
      );
      return;
    }

    setAttachmentError("");
    setAttachmentFile(file);
  }

  function removeAttachment() {
    setAttachmentFile(null);
    setAttachmentError("");
  }

  // =====================================================
  // CREATE SUBMIT
  // =====================================================

  async function handleCreateSubmit(event) {
    event.preventDefault();

    const title = createForm.title.trim();

    if (!createForm.courseId) {
      setCreateError("Please select a course.");
      return;
    }

    if (!title) {
      setCreateError("Assignment title is required.");
      return;
    }

    if (attachmentError) {
      setCreateError(
        "Please fix the attachment error before submitting."
      );
      return;
    }

    try {
      setCreating(true);
      setCreateError("");

      const formData = new FormData();

      formData.append(
        "courseId",
        Number(createForm.courseId)
      );

      formData.append("title", title);

      if (createForm.description.trim()) {
        formData.append(
          "description",
          createForm.description.trim()
        );
      }

      if (createForm.instructions.trim()) {
        formData.append(
          "instructions",
          createForm.instructions.trim()
        );
      }

      if (createForm.dueDate) {
        formData.append(
          "dueDate",
          `${createForm.dueDate.replace("T", " ")}:00`
        );
      }

      formData.append(
        "points",
        Number(createForm.points) || 100
      );

      if (createForm.allowedFileTypes.trim()) {
        formData.append(
          "allowedFileTypes",
          createForm.allowedFileTypes.trim()
        );
      }

      formData.append(
        "maxFileSizeMb",
        Number(createForm.maxFileSizeMb) || 10
      );

      formData.append("status", createForm.status);

      if (attachmentFile) {
        formData.append("attachment", attachmentFile);
      }

      // Let axios generate the multipart boundary itself —
      // the api instance's default JSON header must be cleared
      // for this one request.
      await api.post("/assignments", formData, {
        headers: {
          "Content-Type": undefined,
        },
      });

      setShowCreateModal(false);

      setSuccessMessage(
        `"${title}" was created successfully.`
      );

      await loadAssignments();
    } catch (err) {
      console.error(
        "Create assignment error:",
        err
      );

      setCreateError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create assignment."
      );
    } finally {
      setCreating(false);
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
        assignment.total_submissions ??
        0
    );

    const gradedSubmissions = Number(
      assignment.gradedSubmissions ??
        assignment.gradedCount ??
        assignment.graded_submissions ??
        assignment.graded_count ??
        0
    );

    const safeTotalSubmissions = Math.max(
      totalSubmissions,
      0
    );

    const safeGradedSubmissions = Math.min(
      Math.max(gradedSubmissions, 0),
      safeTotalSubmissions
    );

    const pendingSubmissions = Math.max(
      safeTotalSubmissions -
        safeGradedSubmissions,
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

      totalSubmissions:
        safeTotalSubmissions,

      gradedSubmissions:
        safeGradedSubmissions,

      pendingSubmissions,

      maxScore: Number(
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
    const query = search
      .trim()
      .toLowerCase();

    return normalizedAssignments.filter(
      (assignment) => {
        const title =
          String(
            assignment.title || ""
          ).toLowerCase();

        const courseTitle =
          String(
            assignment.courseTitle || ""
          ).toLowerCase();

        const matchesSearch =
          !query ||
          title.includes(query) ||
          courseTitle.includes(query);

        if (!matchesSearch) {
          return false;
        }

        switch (statusFilter) {
          case "pending":
            return (
              assignment.pendingSubmissions > 0
            );

          case "graded":
            return (
              assignment.totalSubmissions > 0 &&
              assignment.pendingSubmissions === 0
            );

          case "no-submissions":
            return (
              assignment.totalSubmissions === 0
            );

          case "all":
          default:
            return true;
        }
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
          total +
          assignment.totalSubmissions,
        0
      );

    const gradedSubmissions =
      normalizedAssignments.reduce(
        (total, assignment) =>
          total +
          assignment.gradedSubmissions,
        0
      );

    const pendingSubmissions =
      normalizedAssignments.reduce(
        (total, assignment) =>
          total +
          assignment.pendingSubmissions,
        0
      );

    const gradingRate =
      totalSubmissions > 0
        ? Math.round(
            (gradedSubmissions /
              totalSubmissions) *
              100
          )
        : 0;

    return {
      totalAssignments,
      totalSubmissions,
      gradedSubmissions,
      pendingSubmissions,
      gradingRate,
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

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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
  // DUE DATE STATUS
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

    if (
      Number.isNaN(
        dueDate.getTime()
      )
    ) {
      return {
        label: "No due date",
        className:
          "bg-slate-100 text-slate-500",
      };
    }

    const now = new Date();

    if (dueDate < now) {
      return {
        label: "Past due",
        className:
          "bg-red-50 text-red-600",
      };
    }

    const difference =
      dueDate.getTime() -
      now.getTime();

    const daysRemaining = Math.ceil(
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
            disabled={refreshing}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
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
              ? "Retrying..."
              : "Try Again"}

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

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <ClipboardCheck size={22} />
            </div>

            <div>

              <h1 className="text-xl font-extrabold text-ink">
                Assignments
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage assignments, submissions,
                grading, and feedback.
              </p>

            </div>

          </div>

        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover"
          >
            <Plus size={16} />
            Create Assignment
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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

      </div>

      {/* =================================================
          SUCCESS
      ================================================= */}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
            <CheckCircle2 size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-extrabold text-emerald-800">
              Success
            </p>

            <p className="mt-0.5 text-sm text-emerald-700">
              {successMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="ml-auto rounded-lg p-1 text-emerald-600 transition hover:bg-emerald-100"
            aria-label="Dismiss success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* ASSIGNMENTS */}

        <section className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <FileText size={20} />
            </div>

            <span className="text-xs font-bold text-primary">
              Total
            </span>

          </div>

          <p className="mt-5 text-xs font-semibold text-slate-400">
            Assignments
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink">
            {statistics.totalAssignments}
          </p>

        </section>

        {/* SUBMISSIONS */}

        <section className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={20} />
            </div>

            <span className="text-xs font-bold text-blue-600">
              Students
            </span>

          </div>

          <p className="mt-5 text-xs font-semibold text-slate-400">
            Submissions
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink">
            {statistics.totalSubmissions}
          </p>

        </section>

        {/* GRADED */}

        <section className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <CheckCircle2 size={20} />
            </div>

            <span className="text-xs font-bold text-green-600">
              {statistics.gradingRate}%
            </span>

          </div>

          <p className="mt-5 text-xs font-semibold text-slate-400">
            Graded
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink">
            {statistics.gradedSubmissions}
          </p>

        </section>

        {/* PENDING */}

        <section className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Clock3 size={20} />
            </div>

            {statistics.pendingSubmissions > 0 && (
              <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600">
                Action needed
              </span>
            )}

          </div>

          <p className="mt-5 text-xs font-semibold text-slate-400">
            Awaiting Review
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink">
            {statistics.pendingSubmissions}
          </p>

        </section>

      </div>

      {/* =================================================
          MANAGEMENT PANEL
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

        {/* HEADER */}

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">

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
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-64"
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
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >

              <option value="all">
                All Assignments
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
                  key={
                    assignment.id ??
                    `${assignment.title}-${assignment.courseTitle}`
                  }
                  className="p-5 transition hover:bg-slate-50/60"
                >

                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                    {/* INFO */}

                    <div className="flex min-w-0 items-start gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                        <FileText size={21} />
                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-sm font-bold text-ink">
                            {assignment.title}
                          </h3>

                          {assignment.pendingSubmissions > 0 && (
                            <span className="rounded-full bg-orange-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-orange-600">
                              Needs Review
                            </span>
                          )}

                        </div>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">

                          <BookOpen
                            size={13}
                          />

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

                    <div className="grid grid-cols-3 gap-2 sm:gap-3 xl:min-w-[360px]">

                      {/* SUBMITTED */}

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

                      {/* GRADED */}

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

                      {/* PENDING */}

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

                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleViewAssignment(assignment)
                      }
                      disabled={
                        downloadingAttachmentId ===
                        assignment.id
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {downloadingAttachmentId ===
                      assignment.id ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : assignment.attachment_url ? (
                        <Download size={14} />
                      ) : (
                        <Eye size={14} />
                      )}

                      {assignment.attachment_url
                        ? "Download File"
                        : "View Assignment"}

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleReviewSubmissions(assignment)
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-hover"
                    >

                      <ClipboardCheck
                        size={14}
                      />

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
            <div className="px-5 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FileText size={28} />
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
                  : "Create your first assignment to get started."}
              </p>

              {(search ||
                statusFilter !== "all") ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-light px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/10"
                >
                  <RefreshCw size={13} />
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-hover"
                >
                  <Plus size={13} />
                  Create Assignment
                </button>
              )}

            </div>
          )}

        </div>

      </section>

      {/* =================================================
          CREATE ASSIGNMENT MODAL
      ================================================= */}

      {showCreateModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-assignment-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-primary">
                  <FileText size={15} />
                  New Assignment
                </div>

                <h2
                  id="create-assignment-title"
                  className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl"
                >
                  Create Assignment
                </h2>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={creating}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close create assignment modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleCreateSubmit}>
              <div className="space-y-5 p-5 sm:p-6">

                {createError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3.5">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-red-500"
                    />

                    <p className="text-sm font-medium text-red-600">
                      {createError}
                    </p>
                  </div>
                )}

                {/* COURSE */}

                <div>
                  <label
                    htmlFor="assignment-course"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Course
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <select
                    id="assignment-course"
                    name="courseId"
                    value={createForm.courseId}
                    onChange={handleCreateChange}
                    required
                    disabled={coursesLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60"
                  >
                    <option value="">
                      {coursesLoading
                        ? "Loading your courses..."
                        : "Select a course"}
                    </option>

                    {myCourses.map((course) => (
                      <option
                        key={course.id}
                        value={course.id}
                      >
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TITLE */}

                <div>
                  <label
                    htmlFor="assignment-title"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Title
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="assignment-title"
                    name="title"
                    type="text"
                    value={createForm.title}
                    onChange={handleCreateChange}
                    placeholder="e.g. Chapter 3 Essay"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label
                    htmlFor="assignment-description"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="assignment-description"
                    name="description"
                    value={createForm.description}
                    onChange={handleCreateChange}
                    rows={3}
                    placeholder="Short summary of the assignment..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                {/* INSTRUCTIONS */}

                <div>
                  <label
                    htmlFor="assignment-instructions"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Instructions
                  </label>

                  <textarea
                    id="assignment-instructions"
                    name="instructions"
                    value={createForm.instructions}
                    onChange={handleCreateChange}
                    rows={4}
                    placeholder="Detailed instructions for students..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                {/* ATTACHMENT */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Assignment Attachment
                  </label>

                  {!attachmentFile ? (
                    <label
                      htmlFor="assignment-attachment"
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition hover:border-primary/40 hover:bg-blue-50/30"
                    >
                      <Upload
                        size={22}
                        className="text-slate-400"
                      />

                      <span className="text-sm font-semibold text-slate-600">
                        Click to select a file from your computer
                      </span>

                      <span className="text-xs text-slate-400">
                        PDF, DOC, PPT, XLS, ZIP, or image — up to {MAX_ATTACHMENT_SIZE_MB}MB
                      </span>

                      <input
                        id="assignment-attachment"
                        type="file"
                        onChange={handleAttachmentChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText
                          size={20}
                          className="shrink-0 text-primary"
                        />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {attachmentFile.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {formatFileSize(
                              attachmentFile.size
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove attachment"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {attachmentError && (
                    <p className="mt-2 text-xs font-semibold text-red-600">
                      {attachmentError}
                    </p>
                  )}
                </div>

                {/* DUE DATE + POINTS */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="assignment-due-date"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Due Date
                    </label>

                    <input
                      id="assignment-due-date"
                      name="dueDate"
                      type="datetime-local"
                      value={createForm.dueDate}
                      onChange={handleCreateChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="assignment-points"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Points
                    </label>

                    <input
                      id="assignment-points"
                      name="points"
                      type="number"
                      min="0"
                      step="1"
                      value={createForm.points}
                      onChange={handleCreateChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {/* FILE TYPES + MAX SIZE */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="assignment-file-types"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Allowed Submission File Types
                    </label>

                    <input
                      id="assignment-file-types"
                      name="allowedFileTypes"
                      type="text"
                      value={createForm.allowedFileTypes}
                      onChange={handleCreateChange}
                      placeholder=".pdf,.docx,.zip"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="assignment-max-size"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Max Submission Size (MB)
                    </label>

                    <input
                      id="assignment-max-size"
                      name="maxFileSizeMb"
                      type="number"
                      min="1"
                      step="1"
                      value={createForm.maxFileSizeMb}
                      onChange={handleCreateChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {/* STATUS */}

                <div>
                  <label
                    htmlFor="assignment-status"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Status
                  </label>

                  <select
                    id="assignment-status"
                    name="status"
                    value={createForm.status}
                    onChange={handleCreateChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="published">
                      Published (visible to students)
                    </option>
                    <option value="draft">
                      Draft (hidden from students)
                    </option>
                  </select>
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={creating}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Assignment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}