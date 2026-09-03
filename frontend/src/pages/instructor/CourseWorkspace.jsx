import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  Eye,
  FileText,
  GraduationCap,
  HelpCircle,
  ListChecks,
  Pencil,
  Plus,
  RefreshCw,
  Timer,
  Users,
  Video,
  X,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import api from "../../services/api";
import {
  getQuizById,
  getQuizzesByCourse,
} from "../../services/quizApi";

function CourseWorkspace() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [courseDetails, setCourseDetails] = useState(null);

  const [sections, setSections] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [activeTab, setActiveTab] = useState("lessons");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ============================================================
  // LESSON MODAL
  // ============================================================

  const [showLessonModal, setShowLessonModal] = useState(false);

  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    videoUrl: "",
    summary: "",
    sectionId: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // ============================================================
  // SECTION MODAL
  // ============================================================

  const [showSectionModal, setShowSectionModal] = useState(false);

  const [sectionFormData, setSectionFormData] = useState({
    title: "",
    description: "",
  });

  const [sectionSubmitting, setSectionSubmitting] = useState(false);
  const [sectionFormError, setSectionFormError] = useState("");

  // ============================================================
  // QUIZ STATE
  // ============================================================

  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [quizLoadError, setQuizLoadError] = useState("");

  const [quizPreviewLoading, setQuizPreviewLoading] =
    useState(false);

  const [quizPreview, setQuizPreview] = useState(null);
  const [quizPreviewError, setQuizPreviewError] = useState("");
  const [showQuizPreview, setShowQuizPreview] = useState(false);

  // ============================================================
  // NORMALIZE API RESPONSE
  // ============================================================

  const extractArray = useCallback((response) => {
    const body = response?.data;

    if (Array.isArray(body)) {
      return body;
    }

    if (Array.isArray(body?.data)) {
      return body.data;
    }

    if (Array.isArray(body?.lessons)) {
      return body.lessons;
    }

    if (Array.isArray(body?.assignments)) {
      return body.assignments;
    }

    if (Array.isArray(body?.courses)) {
      return body.courses;
    }

    if (Array.isArray(body?.quizzes)) {
      return body.quizzes;
    }

    if (Array.isArray(body?.sections)) {
      return body.sections;
    }

    return [];
  }, []);

  const extractObject = useCallback((response) => {
    const body = response?.data;

    if (body?.data && !Array.isArray(body.data)) {
      return body.data;
    }

    if (body?.course) {
      return body.course;
    }

    return body || null;
  }, []);

  // ============================================================
  // FETCH COURSE
  // ============================================================

  const fetchCourse = useCallback(async () => {
    const response = await api.get(`/courses/${courseId}`);

    return extractObject(response);
  }, [courseId, extractObject]);

  // ============================================================
  // FETCH SECTIONS
  // ============================================================

  const fetchSections = useCallback(async () => {
    try {
      const response = await api.get(
        `/course-sections/course/${courseId}`
      );

      return extractArray(response);
    } catch (err) {
      console.error("Failed to load sections:", err);
      return [];
    }
  }, [courseId, extractArray]);

  // ============================================================
  // FETCH LESSONS
  // ============================================================

  // NOTE: There is no `/lessons?courseId=` endpoint on the backend —
  // lessons are related to a section, not directly to a course.
  // The `/course-sections/course/:courseId` endpoint already returns
  // each section with its `lessons` array nested inside, so we derive
  // the flat lesson list from the sections we already fetched instead
  // of calling a separate (non-existent) endpoint.
  const deriveLessonsFromSections = useCallback((sectionsList) => {
    if (!Array.isArray(sectionsList)) {
      return [];
    }

    return sectionsList.flatMap((section) =>
      Array.isArray(section?.lessons)
        ? section.lessons.map((lesson) => ({
            ...lesson,
            sectionId: lesson.section_id ?? lesson.sectionId ?? section.id,
          }))
        : []
    );
  }, []);

  const fetchLessons = useCallback(
    async (sectionId) => {
      try {
        const response = await api.get(
          `/lessons/section/${sectionId}`
        );

        return extractArray(response);
      } catch (err) {
        console.error("Failed to load lessons:", err);
        return [];
      }
    },
    [extractArray]
  );

  // ============================================================
  // FETCH ASSIGNMENTS
  // ============================================================

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await api.get(
        "/assignments/instructor"
      );

      const allAssignments = extractArray(response);

      return allAssignments.filter((assignment) => {
        const assignmentCourseId =
          assignment.course_id ??
          assignment.courseId;

        return (
          Number(assignmentCourseId) ===
          Number(courseId)
        );
      });
    } catch (err) {
      console.error(
        "Failed to load instructor assignments:",
        err
      );

      return [];
    }
  }, [courseId, extractArray]);

  // ============================================================
  // FETCH QUIZZES
  // ============================================================

  const fetchQuizzes = useCallback(async () => {
    try {
      setQuizzesLoading(true);
      setQuizLoadError("");

      const response = await getQuizzesByCourse(courseId);

      const body = response?.data ?? response;

      if (Array.isArray(body)) {
        return body;
      }

      if (Array.isArray(body?.data)) {
        return body.data;
      }

      if (Array.isArray(body?.quizzes)) {
        return body.quizzes;
      }

      return [];
    } catch (err) {
      console.error(
        "Failed to load course quizzes:",
        err
      );

      setQuizLoadError(
        err?.response?.data?.message ||
          "Unable to load course quizzes."
      );

      return [];
    } finally {
      setQuizzesLoading(false);
    }
  }, [courseId]);

  // ============================================================
  // LOAD WORKSPACE
  // ============================================================

  const loadWorkspaceData = useCallback(
    async (isRefresh = false) => {
      const normalizedCourseId = Number(courseId);

      if (
        !courseId ||
        !Number.isInteger(normalizedCourseId) ||
        normalizedCourseId <= 0
      ) {
        setError("Invalid course ID.");
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");
        setSuccessMessage("");

        const [
          course,
          courseSections,
          courseAssignments,
          courseQuizzes,
        ] = await Promise.all([
          fetchCourse(),
          fetchSections(),
          fetchAssignments(),
          fetchQuizzes(),
        ]);

        if (!course) {
          throw new Error(
            "Course information could not be found."
          );
        }

        const courseLessons = deriveLessonsFromSections(
          courseSections
        );

        setCourseDetails(course);
        setSections(courseSections);
        setLessons(courseLessons);
        setAssignments(courseAssignments);
        setQuizzes(courseQuizzes);
      } catch (err) {
        console.error(
          "Course workspace loading error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load course workspace."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      courseId,
      fetchCourse,
      fetchSections,
      deriveLessonsFromSections,
      fetchAssignments,
      fetchQuizzes,
    ]
  );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  // ============================================================
  // LESSON FORM
  // ============================================================

  const handleLessonChange = (event) => {
    const { name, value } = event.target;

    setLessonFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  // ============================================================
  // OPEN LESSON MODAL
  // ============================================================

  const openLessonModal = (sectionId = "") => {
    setFormError("");

    setLessonFormData({
      title: "",
      videoUrl: "",
      summary: "",
      sectionId: sectionId
        ? String(sectionId)
        : sections[0]?.id
          ? String(sections[0].id)
          : "",
    });

    setShowLessonModal(true);
  };

  // ============================================================
  // CLOSE LESSON MODAL
  // ============================================================

  const closeLessonModal = () => {
    if (submitting) return;

    setShowLessonModal(false);
    setFormError("");

    setLessonFormData({
      title: "",
      videoUrl: "",
      summary: "",
      sectionId: "",
    });
  };

  // ============================================================
  // CREATE LESSON
  // ============================================================

  const handleLessonCreate = async (event) => {
    event.preventDefault();

    const title = lessonFormData.title.trim();

    if (!title) {
      setFormError("Lesson title is required.");
      return;
    }

    if (!lessonFormData.sectionId) {
      setFormError(
        "Please select a section before creating the lesson."
      );
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      setError("");
      setSuccessMessage("");

      const payload = {
        sectionId: Number(
          lessonFormData.sectionId
        ),
        title,
        videoUrl:
          lessonFormData.videoUrl.trim(),
        description:
          lessonFormData.summary.trim(),
        isPublished: true,
      };

      const response = await api.post(
        "/lessons",
        payload
      );

      const newLesson =
        response?.data?.data ||
        response?.data?.lesson ||
        response?.data;

      if (
        newLesson &&
        typeof newLesson === "object"
      ) {
        setLessons((previous) => [
          ...previous,
          newLesson,
        ]);
      } else {
        const latestSections =
          await fetchSections();

        setSections(latestSections);
        setLessons(
          deriveLessonsFromSections(latestSections)
        );
      }

      setShowLessonModal(false);

      setLessonFormData({
        title: "",
        videoUrl: "",
        summary: "",
        sectionId: "",
      });

      setSuccessMessage(
        `"${title}" was created successfully.`
      );
    } catch (err) {
      console.error(
        "Lesson creation failed:",
        err
      );

      setFormError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create lesson. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // SECTION FORM
  // ============================================================

  const handleSectionChange = (event) => {
    const { name, value } = event.target;

    setSectionFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (sectionFormError) {
      setSectionFormError("");
    }
  };

  // ============================================================
  // OPEN SECTION MODAL
  // ============================================================

  const openSectionModal = () => {
    setSectionFormError("");

    setSectionFormData({
      title: "",
      description: "",
    });

    setShowSectionModal(true);
  };

  // ============================================================
  // CLOSE SECTION MODAL
  // ============================================================

  const closeSectionModal = () => {
    if (sectionSubmitting) return;

    setShowSectionModal(false);
    setSectionFormError("");

    setSectionFormData({
      title: "",
      description: "",
    });
  };

  // ============================================================
  // CREATE SECTION
  // ============================================================

  const handleSectionCreate = async (event) => {
    event.preventDefault();

    const title = sectionFormData.title.trim();

    if (!title) {
      setSectionFormError(
        "Section title is required."
      );
      return;
    }

    try {
      setSectionSubmitting(true);
      setSectionFormError("");
      setError("");
      setSuccessMessage("");

      const payload = {
        courseId: Number(courseId),
        title,
        description:
          sectionFormData.description.trim(),
      };

      const response = await api.post(
        "/course-sections",
        payload
      );

      const newSection =
        response?.data?.data ||
        response?.data?.section ||
        response?.data;

      if (
        newSection &&
        typeof newSection === "object"
      ) {
        setSections((previous) => [
          ...previous,
          newSection,
        ]);
      } else {
        const latestSections =
          await fetchSections();

        setSections(latestSections);
      }

      setShowSectionModal(false);

      setSectionFormData({
        title: "",
        description: "",
      });

      setSuccessMessage(
        `"${title}" section was created successfully.`
      );
    } catch (err) {
      console.error(
        "Section creation failed:",
        err
      );

      setSectionFormError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create section. Please try again."
      );
    } finally {
      setSectionSubmitting(false);
    }
  };

  // ============================================================
  // ASSIGNMENT CLICK
  // ============================================================

  const handleAssignmentClick = (
    assignment
  ) => {
    const id = assignment?.id;

    if (!id) return;

    navigate(
      `/instructor/assignments/${id}`
    );
  };

  // ============================================================
  // QUIZ HELPERS
  // ============================================================

  const getQuizId = (quiz) =>
    quiz?.id ?? quiz?.quiz_id;

  const getQuizTitle = (quiz) =>
    quiz?.title || "Untitled Quiz";

  const getQuizStatus = (quiz) =>
    quiz?.status || "draft";

  const getQuizQuestionCount = (quiz) =>
    Number(
      quiz?.total_questions ??
        quiz?.question_count ??
        quiz?.questions_count ??
        quiz?.questions?.length ??
        0
    );

  const getQuizTimeLimit = (quiz) =>
    quiz?.time_limit_minutes ??
    quiz?.timeLimitMinutes ??
    null;

  // ============================================================
  // QUIZ NAVIGATION
  // ============================================================

  const openCreateQuiz = () => {
    navigate(
      `/instructor/quizzes/create?courseId=${courseId}`
    );
  };

  const openEditQuiz = (quiz) => {
    const id = getQuizId(quiz);

    if (!id) {
      setError(
        "This quiz does not have a valid ID."
      );
      return;
    }

    navigate(
      `/instructor/quizzes/${id}/edit`
    );
  };

  // ============================================================
  // QUIZ PREVIEW
  // ============================================================

  const openQuizPreview = async (quiz) => {
    const id = getQuizId(quiz);

    if (!id) {
      setQuizPreviewError(
        "This quiz does not have a valid ID."
      );

      setShowQuizPreview(true);
      return;
    }

    try {
      setQuizPreviewLoading(true);
      setQuizPreviewError("");
      setQuizPreview(null);
      setShowQuizPreview(true);

      const response =
        await getQuizById(id);

      const data =
        response?.data ?? response;

      if (
        !data ||
        typeof data !== "object"
      ) {
        throw new Error(
          "Quiz details could not be loaded."
        );
      }

      setQuizPreview(data);
    } catch (err) {
      console.error(
        "Failed to load quiz preview:",
        err
      );

      setQuizPreviewError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load quiz details."
      );
    } finally {
      setQuizPreviewLoading(false);
    }
  };

  const closeQuizPreview = () => {
    if (quizPreviewLoading) return;

    setShowQuizPreview(false);
    setQuizPreview(null);
    setQuizPreviewError("");
  };

  // ============================================================
  // FORMATTING
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "No date";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Invalid date";
    }

    return parsedDate.toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ============================================================
  // COMPUTED DATA
  // ============================================================

  const publishedLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      return (
        !lesson.status ||
        String(
          lesson.status
        ).toLowerCase() === "published"
      );
    });
  }, [lessons]);

  const activeAssignments = useMemo(() => {
    return assignments.filter(
      (assignment) =>
        String(
          assignment.status || ""
        ).toLowerCase() !== "archived"
    );
  }, [assignments]);

  const totalPoints = useMemo(() => {
    return assignments.reduce(
      (total, assignment) =>
        total +
        Number(
          assignment.points || 0
        ),
      0
    );
  }, [assignments]);

  const coursePrice = Number(
    courseDetails?.price || 0
  );

  const publishedQuizzes = useMemo(() => {
    return quizzes.filter(
      (quiz) =>
        String(
          quiz?.status || "draft"
        ).toLowerCase() ===
        "published"
    );
  }, [quizzes]);

  const draftQuizzes = useMemo(() => {
    return quizzes.filter(
      (quiz) =>
        String(
          quiz?.status || "draft"
        ).toLowerCase() ===
        "draft"
    );
  }, [quizzes]);

  const totalQuizQuestions = useMemo(() => {
    return quizzes.reduce(
      (total, quiz) =>
        total +
        getQuizQuestionCount(quiz),
      0
    );
  }, [quizzes]);

  const sortedSections = useMemo(() => {
    return [...sections].sort(
      (a, b) =>
        Number(
          a.order ??
            a.position ??
            a.section_order ??
            0
        ) -
        Number(
          b.order ??
            b.position ??
            b.section_order ??
            0
        )
    );
  }, [sections]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center gap-3 bg-slate-50">
        <Spinner />

        <p className="text-sm font-medium text-slate-500">
          Loading instructor workspace...
        </p>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error && !courseDetails) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle
              size={26}
              className="text-red-500"
            />
          </div>

          <h2 className="mt-5 text-xl font-extrabold text-slate-900">
            Unable to load workspace
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              onClick={() =>
                navigate(
                  "/instructor/dashboard"
                )
              }
            >
              Back to Dashboard
            </Button>

            <Button
              onClick={() =>
                loadWorkspaceData()
              }
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f8fafc] p-3 sm:p-5 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />

          <div className="p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/instructor/dashboard"
                    )
                  }
                  className="mb-4 inline-flex items-center gap-2 rounded-lg text-sm font-bold text-primary transition hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  <ArrowLeft size={16} />
                  Back to Dashboard
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-extrabold text-white shadow-lg shadow-blue-600/20">
                    <BookOpen size={22} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="break-words text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                        {courseDetails?.title ||
                          "Course Workspace"}
                      </h1>

                      <StatusBadge
                        status={
                          courseDetails?.status ||
                          "active"
                        }
                      />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 sm:text-sm">
                      <span>
                        Course ID: #
                        {courseId}
                      </span>

                      {courseDetails?.category && (
                        <span>
                          Category:{" "}
                          {courseDetails.category}
                        </span>
                      )}

                      {courseDetails?.created_at && (
                        <span>
                          Created{" "}
                          {formatDate(
                            courseDetails.created_at
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    loadWorkspaceData(true)
                  }
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
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

                <button
                  type="button"
                  onClick={
                    openSectionModal
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-bold text-primary shadow-sm transition hover:border-blue-200 hover:bg-blue-100 hover:shadow-md"
                >
                  <Plus size={17} />
                  Add Section
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openLessonModal()
                  }
                  disabled={
                    sections.length === 0
                  }
                  title={
                    sections.length === 0
                      ? "Create a section first"
                      : "Add a lesson"
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={17} />
                  Add Lesson
                </button>

                <button
                  type="button"
                  onClick={openCreateQuiz}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md"
                >
                  <ClipboardList size={16} />
                  Create Quiz
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/instructor/assignments"
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md"
                >
                  <FileText size={16} />
                  Assignments
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ======================================================
            SUCCESS
        ====================================================== */}

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
              onClick={() =>
                setSuccessMessage("")
              }
              className="ml-auto rounded-lg p-1 text-emerald-600 transition hover:bg-emerald-100"
              aria-label="Dismiss success message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && courseDetails && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm">
              <AlertCircle size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-red-800">
                Something went wrong
              </p>

              <p className="mt-0.5 text-sm text-red-600">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-1 text-red-500 transition hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* ======================================================
            KPI CARDS
        ====================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard
            icon={BookOpen}
            title="Lessons"
            value={lessons.length}
            subtitle={`${publishedLessons.length} published`}
            color="blue"
          />

          <KpiCard
            icon={FileText}
            title="Assignments"
            value={assignments.length}
            subtitle={`${activeAssignments.length} active`}
            color="violet"
          />

          <KpiCard
            icon={ListChecks}
            title="Total Points"
            value={totalPoints}
            subtitle="Available assignment points"
            color="emerald"
          />

          <KpiCard
            icon={ClipboardList}
            title="Quizzes"
            value={
              quizzesLoading
                ? "…"
                : quizzes.length
            }
            subtitle={
              quizzesLoading
                ? "Loading assessments"
                : `${publishedQuizzes.length} published · ${draftQuizzes.length} draft`
            }
            color="amber"
          />

          <KpiCard
            icon={GraduationCap}
            title="Course Price"
            value={
              coursePrice > 0
                ? `${coursePrice} ETB`
                : "Free"
            }
            subtitle="Current course price"
            color="indigo"
          />
        </div>

        {/* ======================================================
            TABS
        ====================================================== */}

        <div className="flex overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <TabButton
            active={
              activeTab === "lessons"
            }
            onClick={() =>
              setActiveTab("lessons")
            }
            icon={BookOpen}
            label={`Lessons (${lessons.length})`}
          />

          <TabButton
            active={
              activeTab === "assignments"
            }
            onClick={() =>
              setActiveTab(
                "assignments"
              )
            }
            icon={FileText}
            label={`Assignments (${assignments.length})`}
          />

          <TabButton
            active={
              activeTab === "quizzes"
            }
            onClick={() =>
              setActiveTab("quizzes")
            }
            icon={ClipboardList}
            label={`Quizzes (${quizzes.length})`}
          />
        </div>

        {/* ======================================================
            MAIN GRID
        ====================================================== */}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">

          {/* ==================================================
              MAIN CONTENT
          ================================================== */}

          <main className="min-w-0">

            {/* ==================================================
                LESSONS / CURRICULUM
            ================================================== */}

            {activeTab === "lessons" && (
              <Card>
                <div className="border-b border-slate-100 px-4 py-5 sm:px-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-primary">
                          <BookOpen size={18} />
                        </div>

                        <div>
                          <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                            Course Curriculum
                          </h2>

                          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                            Organize your course into sections and lessons.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        openSectionModal
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs font-extrabold text-primary transition hover:bg-blue-100 sm:text-sm"
                    >
                      <Plus size={15} />
                      Add Section
                    </button>
                  </div>
                </div>

                {sections.length === 0 ? (
                  <div className="p-4 sm:p-6">
                    <EmptyState
                      icon={BookOpen}
                      title="Build your course curriculum"
                      description="Start by creating your first section. You can then add lessons inside each section."
                      buttonText="Create First Section"
                      onClick={
                        openSectionModal
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-5 p-3 sm:p-5">

                    {sortedSections.map(
                      (
                        section,
                        sectionIndex
                      ) => {
                        const sectionLessons =
                          lessons.filter(
                            (lesson) => {
                              const lessonSectionId =
                                lesson.section_id ??
                                lesson.sectionId;

                              return (
                                Number(
                                  lessonSectionId
                                ) ===
                                Number(
                                  section.id
                                )
                              );
                            }
                          );

                        return (
                          <section
                            key={
                              section.id ??
                              `section-${sectionIndex}`
                            }
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
                          >
                            {/* SECTION HEADER */}

                            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 px-4 py-4 sm:px-5">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex min-w-0 items-start gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-extrabold text-white shadow-md shadow-blue-600/15">
                                    {sectionIndex +
                                      1}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">
                                        {section.title ||
                                          `Section ${
                                            sectionIndex +
                                            1
                                          }`}
                                      </h3>

                                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                                        Section
                                      </span>
                                    </div>

                                    {section.description && (
                                      <p className="mt-1 line-clamp-2 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                                        {
                                          section.description
                                        }
                                      </p>
                                    )}

                                    <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-400">
                                      <BookOpen
                                        size={
                                          13
                                        }
                                      />

                                      {
                                        sectionLessons.length
                                      }{" "}
                                      {sectionLessons.length ===
                                      1
                                        ? "lesson"
                                        : "lessons"}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openLessonModal(
                                      section.id
                                    )
                                  }
                                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-primary-hover hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                >
                                  <Plus size={15} />
                                  Add Lesson
                                </button>
                              </div>
                            </div>

                            {/* SECTION LESSONS */}

                            {sectionLessons.length ===
                            0 ? (
                              <div className="p-7 text-center">
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                  <BookOpen
                                    size={20}
                                  />
                                </div>

                                <p className="mt-3 text-sm font-bold text-slate-700">
                                  No lessons in this section
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Add a lesson to start building this section.
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openLessonModal(
                                      section.id
                                    )
                                  }
                                  className="mt-3 text-xs font-extrabold text-primary hover:underline"
                                >
                                  + Add the first lesson
                                </button>
                              </div>
                            ) : (
                              <div className="divide-y divide-slate-100">
                                {sectionLessons.map(
                                  (
                                    lesson,
                                    lessonIndex
                                  ) => {
                                    const videoUrl =
                                      lesson.video_url ??
                                      lesson.videoUrl ??
                                      "";

                                    return (
                                      <div
                                        key={
                                          lesson.id ??
                                          `lesson-${section.id}-${lessonIndex}`
                                        }
                                        className="group px-4 py-4 transition hover:bg-slate-50/70 sm:px-5"
                                      >
                                        <div className="flex items-start gap-3 sm:gap-4">

                                          {/* LESSON NUMBER */}

                                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-500 transition group-hover:bg-blue-50 group-hover:text-primary">
                                            {String(
                                              lessonIndex +
                                                1
                                            ).padStart(
                                              2,
                                              "0"
                                            )}
                                          </div>

                                          {/* CONTENT */}

                                          <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <h4 className="text-sm font-bold text-slate-900 sm:text-base">
                                                {lesson.title ||
                                                  "Untitled Lesson"}
                                              </h4>

                                              <StatusBadge
                                                status={
                                                  lesson.status ||
                                                  "published"
                                                }
                                              />
                                            </div>

                                            {lesson.summary && (
                                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 sm:text-sm">
                                                {
                                                  lesson.summary
                                                }
                                              </p>
                                            )}

                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-slate-400">
                                              {videoUrl && (
                                                <span className="inline-flex items-center gap-1">
                                                  <Video
                                                    size={
                                                      13
                                                    }
                                                  />
                                                  Video
                                                </span>
                                              )}

                                              {lesson.created_at && (
                                                <span className="inline-flex items-center gap-1">
                                                  <Clock3
                                                    size={
                                                      13
                                                    }
                                                  />
                                                  {formatDate(
                                                    lesson.created_at
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          <ChevronRight
                                            size={
                                              17
                                            }
                                            className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary"
                                          />
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </section>
                        );
                      }
                    )}

                    {/* ADD SECTION */}

                    <button
                      type="button"
                      onClick={
                        openSectionModal
                      }
                      className="group flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white px-5 py-5 text-sm font-extrabold text-slate-500 transition hover:border-blue-200 hover:bg-blue-50/40 hover:text-primary"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-blue-100">
                        <Plus size={18} />
                      </span>

                      Add Another Section
                    </button>
                  </div>
                )}
              </Card>
            )}

            {/* ==================================================
                ASSIGNMENTS
            ================================================== */}

            {activeTab === "assignments" && (
              <Card>
                <div className="border-b border-slate-100 px-4 py-5 sm:px-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                        Course Assignments
                      </h2>

                      <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Manage assignments associated with this course.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/instructor/assignments"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-slate-800 sm:text-sm"
                    >
                      <FileText size={15} />
                      Manage Assignments
                    </button>
                  </div>
                </div>

                {assignments.length ===
                0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No assignments yet"
                    description="Create assignments from the instructor assignment management page."
                    buttonText="Manage Assignments"
                    onClick={() =>
                      navigate(
                        "/instructor/assignments"
                      )
                    }
                  />
                ) : (
                  <div className="space-y-3 p-3 sm:p-5">
                    {assignments.map(
                      (
                        assignment,
                        index
                      ) => {
                        const title =
                          assignment.title ||
                          `Assignment ${
                            index + 1
                          }`;

                        const description =
                          assignment.description ||
                          "No description provided.";

                        const points =
                          assignment.points ??
                          100;

                        const dueDate =
                          assignment.due_date ??
                          assignment.dueDate;

                        const status =
                          assignment.status ||
                          "draft";

                        const clickable =
                          Boolean(
                            assignment.id
                          );

                        return (
                          <button
                            type="button"
                            key={
                              assignment.id ??
                              `assignment-${index}`
                            }
                            onClick={() =>
                              clickable &&
                              handleAssignmentClick(
                                assignment
                              )
                            }
                            disabled={
                              !clickable
                            }
                            className={`w-full rounded-2xl border bg-white p-4 text-left transition sm:p-5 ${
                              clickable
                                ? "cursor-pointer border-slate-200 hover:border-primary/30 hover:shadow-md"
                                : "cursor-default border-slate-200"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                    Assignment{" "}
                                    {index +
                                      1}
                                  </span>

                                  <StatusBadge
                                    status={
                                      status
                                    }
                                  />
                                </div>

                                <h3 className="mt-2 text-base font-bold text-slate-900">
                                  {title}
                                </h3>

                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                  {
                                    description
                                  }
                                </p>
                              </div>

                              <div className="shrink-0 rounded-xl bg-blue-50 px-3 py-2 text-center">
                                <div className="text-lg font-extrabold text-primary">
                                  {points}
                                </div>

                                <div className="text-[10px] font-bold uppercase tracking-wide text-blue-400">
                                  points
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                              <span>
                                Due:{" "}
                                <strong className="text-slate-700">
                                  {formatDate(
                                    dueDate
                                  )}
                                </strong>
                              </span>

                              {assignment.lesson_id && (
                                <span>
                                  Lesson:{" "}
                                  <strong className="text-slate-700">
                                    {
                                      assignment.lesson_id
                                    }
                                  </strong>
                                </span>
                              )}

                              {assignment.created_at && (
                                <span>
                                  Created:{" "}
                                  <strong className="text-slate-700">
                                    {formatDateTime(
                                      assignment.created_at
                                    )}
                                  </strong>
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* ==================================================
                QUIZZES
            ================================================== */}

            {activeTab === "quizzes" && (
              <Card>
                <div className="border-b border-slate-100 px-4 py-5 sm:px-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                          <ClipboardList size={18} />
                        </div>

                        <div>
                          <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                            Course Quizzes
                          </h2>

                          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                            Create, review, and manage assessments.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        openCreateQuiz
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-primary-hover hover:shadow-md"
                    >
                      <Plus size={15} />
                      Create Quiz
                    </button>
                  </div>
                </div>

                {quizLoadError &&
                  !quizzesLoading && (
                    <div className="mx-3 mt-4 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3.5 sm:mx-5">
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-amber-800">
                          Quiz data could not be loaded
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-700">
                          {
                            quizLoadError
                          }
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          fetchQuizzes()
                        }
                        className="shrink-0 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                {quizzesLoading ? (
                  <div className="flex min-h-64 items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <Spinner />

                      <p className="text-sm font-medium text-slate-500">
                        Loading course quizzes...
                      </p>
                    </div>
                  </div>
                ) : quizzes.length ===
                  0 ? (
                  <EmptyState
                    icon={ClipboardList}
                    title="No quizzes yet"
                    description="Create your first quiz to assess student understanding."
                    buttonText="Create First Quiz"
                    onClick={
                      openCreateQuiz
                    }
                  />
                ) : (
                  <div className="space-y-3 p-3 sm:p-5">

                    {/* QUIZ STATS */}

                    <div className="mb-5 grid gap-3 sm:grid-cols-3">
                      <QuizStat
                        icon={
                          ClipboardList
                        }
                        label="Total Quizzes"
                        value={
                          quizzes.length
                        }
                      />

                      <QuizStat
                        icon={
                          CheckCircle2
                        }
                        label="Published"
                        value={
                          publishedQuizzes.length
                        }
                      />

                      <QuizStat
                        icon={
                          HelpCircle
                        }
                        label="Questions"
                        value={
                          totalQuizQuestions
                        }
                      />
                    </div>

                    {/* QUIZ LIST */}

                    {quizzes.map(
                      (quiz, index) => {
                        const id =
                          getQuizId(
                            quiz
                          );

                        const status =
                          getQuizStatus(
                            quiz
                          );

                        const questionCount =
                          getQuizQuestionCount(
                            quiz
                          );

                        const timeLimit =
                          getQuizTimeLimit(
                            quiz
                          );

                        return (
                          <div
                            key={
                              id ??
                              `quiz-${index}`
                            }
                            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-md sm:p-5"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-extrabold text-primary">
                                    {index +
                                      1}
                                  </span>

                                  <StatusBadge
                                    status={
                                      status
                                    }
                                  />
                                </div>

                                <h3 className="mt-3 text-base font-extrabold text-slate-900 sm:text-lg">
                                  {getQuizTitle(
                                    quiz
                                  )}
                                </h3>

                                {(quiz?.description ||
                                  quiz?.lesson_id) && (
                                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                    {quiz?.description ||
                                      `Linked to lesson #${quiz.lesson_id}`}
                                  </p>
                                )}

                                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
                                  <span className="inline-flex items-center gap-1.5">
                                    <HelpCircle
                                      size={
                                        14
                                      }
                                    />

                                    {
                                      questionCount
                                    }{" "}
                                    {questionCount ===
                                    1
                                      ? "question"
                                      : "questions"}
                                  </span>

                                  <span className="inline-flex items-center gap-1.5">
                                    <Timer
                                      size={
                                        14
                                      }
                                    />

                                    {timeLimit !==
                                      null &&
                                    timeLimit !==
                                      undefined &&
                                    timeLimit !==
                                      ""
                                      ? `${timeLimit} min`
                                      : "No time limit"}
                                  </span>

                                  {quiz?.pass_percent !==
                                    undefined &&
                                    quiz?.pass_percent !==
                                      null && (
                                      <span className="inline-flex items-center gap-1.5">
                                        <BarChart3
                                          size={
                                            14
                                          }
                                        />

                                        Pass{" "}
                                        {
                                          quiz.pass_percent
                                        }
                                        %
                                      </span>
                                    )}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 lg:justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openQuizPreview(
                                      quiz
                                    )
                                  }
                                  disabled={
                                    !id
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-700 transition hover:border-primary/30 hover:bg-blue-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Eye
                                    size={
                                      15
                                    }
                                  />
                                  View Quiz
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditQuiz(
                                      quiz
                                    )
                                  }
                                  disabled={
                                    !id
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Pencil
                                    size={
                                      15
                                    }
                                  />
                                  Edit Quiz
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </Card>
            )}
          </main>

          {/* ==================================================
              SIDEBAR
          ================================================== */}

          <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">

            {/* COURSE INFORMATION */}

            <Card title="Course Information">
              <div className="p-2">
                <InfoRow
                  label="Course ID"
                  value={`#${courseId}`}
                />

                <InfoRow
                  label="Status"
                  value={
                    courseDetails?.status ||
                    "Active"
                  }
                />

                <InfoRow
                  label="Sections"
                  value={
                    sections.length
                  }
                />

                <InfoRow
                  label="Lessons"
                  value={
                    lessons.length
                  }
                />

                <InfoRow
                  label="Assignments"
                  value={
                    assignments.length
                  }
                />

                <InfoRow
                  label="Quizzes"
                  value={
                    quizzesLoading
                      ? "…"
                      : quizzes.length
                  }
                />

                <InfoRow
                  label="Published Quizzes"
                  value={
                    quizzesLoading
                      ? "…"
                      : publishedQuizzes.length
                  }
                />

                <InfoRow
                  label="Students"
                  value={
                    courseDetails?.student_count ??
                    courseDetails?.students_count ??
                    "—"
                  }
                />

                <InfoRow
                  label="Price"
                  value={
                    coursePrice > 0
                      ? `${coursePrice} ETB`
                      : "Free"
                  }
                  last
                />
              </div>
            </Card>

            {/* QUICK ACTIONS */}

            <Card title="Quick Actions">
              <div className="space-y-2 p-2">
                <QuickAction
                  icon={Plus}
                  label="Add Section"
                  onClick={
                    openSectionModal
                  }
                />

                <QuickAction
                  icon={BookOpen}
                  label="Add Lesson"
                  onClick={() =>
                    openLessonModal()
                  }
                  disabled={
                    sections.length ===
                    0
                  }
                />

                <QuickAction
                  icon={ClipboardList}
                  label="Create Quiz"
                  onClick={
                    openCreateQuiz
                  }
                />

                <QuickAction
                  icon={FileText}
                  label="Manage Assignments"
                  onClick={() =>
                    navigate(
                      "/instructor/assignments"
                    )
                  }
                />

                <QuickAction
                  icon={Users}
                  label="View Students"
                  onClick={() =>
                    navigate(
                      `/instructor/courses/${courseId}/students`
                    )
                  }
                />
              </div>
            </Card>

            {/* COURSE DESCRIPTION */}

            {courseDetails?.description && (
              <Card title="About This Course">
                <div className="p-2">
                  <p className="text-sm leading-7 text-slate-500">
                    {
                      courseDetails.description
                    }
                  </p>
                </div>
              </Card>
            )}
          </aside>
        </div>
      </div>

      {/* ========================================================
          QUIZ PREVIEW MODAL
      ======================================================== */}

      {showQuizPreview && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quiz-preview-title"
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-primary">
                  <Eye size={15} />
                  Read-only preview
                </div>

                <h2
                  id="quiz-preview-title"
                  className="mt-1 truncate text-lg font-extrabold text-slate-900 sm:text-xl"
                >
                  {quizPreview?.title ||
                    "Quiz Preview"}
                </h2>

                {quizPreview?.description && (
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    {
                      quizPreview.description
                    }
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={
                  closeQuizPreview
                }
                disabled={
                  quizPreviewLoading
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close quiz preview"
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}

            <div className="min-h-0 flex-1 overflow-y-auto">
              {quizPreviewLoading ? (
                <div className="flex min-h-72 items-center justify-center p-8">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Spinner />

                    <p className="text-sm font-medium text-slate-500">
                      Loading quiz details...
                    </p>
                  </div>
                </div>
              ) : quizPreviewError ? (
                <div className="flex min-h-72 items-center justify-center p-8">
                  <div className="max-w-md text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                      <AlertCircle size={22} />
                    </div>

                    <h3 className="mt-4 text-base font-extrabold text-slate-900">
                      Unable to load quiz
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {
                        quizPreviewError
                      }
                    </p>
                  </div>
                </div>
              ) : quizPreview ? (
                <div className="space-y-5 p-5 sm:p-6">

                  {/* STATS */}

                  <div className="grid gap-3 sm:grid-cols-3">
                    <QuizStat
                      icon={HelpCircle}
                      label="Questions"
                      value={getQuizQuestionCount(
                        quizPreview
                      )}
                    />

                    <QuizStat
                      icon={Timer}
                      label="Time Limit"
                      value={
                        getQuizTimeLimit(
                          quizPreview
                        )
                          ? `${getQuizTimeLimit(
                              quizPreview
                            )} min`
                          : "Unlimited"
                      }
                    />

                    <QuizStat
                      icon={BarChart3}
                      label="Pass Mark"
                      value={`${quizPreview?.pass_percent ?? 0}%`}
                    />
                  </div>

                  {/* QUESTIONS */}

                  {Array.isArray(
                    quizPreview.questions
                  ) &&
                  quizPreview.questions
                    .length > 0 ? (
                    <div className="space-y-4">
                      {quizPreview.questions.map(
                        (
                          question,
                          index
                        ) => (
                          <div
                            key={
                              question.id ??
                              `preview-question-${index}`
                            }
                            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
                          >
                            <div className="flex items-start gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-extrabold text-primary shadow-sm">
                                {index +
                                  1}
                              </span>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                                    Question{" "}
                                    {index +
                                      1}
                                  </span>

                                  {question.points !==
                                    undefined && (
                                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-primary">
                                      {
                                        question.points
                                      }{" "}
                                      {Number(
                                        question.points
                                      ) ===
                                      1
                                        ? "point"
                                        : "points"}
                                    </span>
                                  )}
                                </div>

                                <p className="mt-2 text-sm font-bold leading-6 text-slate-900">
                                  {question.prompt ||
                                    "No question prompt"}
                                </p>

                                {Array.isArray(
                                  question.options
                                ) &&
                                question.options
                                  .length >
                                  0 && (
                                  <div className="mt-4 grid gap-2">
                                    {question.options.map(
                                      (
                                        option,
                                        optionIndex
                                      ) => {
                                        const isCorrect =
                                          option.is_correct ||
                                          option.isCorrect;

                                        const optionKey =
                                          option.option_key ??
                                          option.optionKey ??
                                          String.fromCharCode(
                                            65 +
                                              optionIndex
                                          );

                                        const optionText =
                                          option.option_text ??
                                          option.optionText ??
                                          "Empty option";

                                        return (
                                          <div
                                            key={
                                              option.id ??
                                              `${optionKey}-${optionIndex}`
                                            }
                                            className={`rounded-xl border px-3.5 py-3 text-sm ${
                                              isCorrect
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                                : "border-slate-200 bg-white text-slate-600"
                                            }`}
                                          >
                                            <span className="mr-2 font-extrabold">
                                              {
                                                optionKey
                                              }
                                              .
                                            </span>

                                            {
                                              optionText
                                            }

                                            {isCorrect && (
                                              <span className="ml-2 text-[10px] font-extrabold uppercase tracking-wide">
                                                Correct
                                              </span>
                                            )}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                )}

                                {question.explanation && (
                                  <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                                    <strong>
                                      Explanation:
                                    </strong>{" "}
                                    {
                                      question.explanation
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                      <HelpCircle
                        className="mx-auto text-slate-300"
                        size={30}
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-500">
                        This quiz has no question details to preview.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* FOOTER */}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={
                  closeQuizPreview
                }
                disabled={
                  quizPreviewLoading
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>

              {quizPreview &&
                getQuizId(
                  quizPreview
                ) && (
                  <button
                    type="button"
                    onClick={() => {
                      const quiz =
                        quizPreview;

                      closeQuizPreview();
                      openEditQuiz(
                        quiz
                      );
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-primary-hover"
                  >
                    <Pencil size={15} />
                    Edit Quiz
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD SECTION MODAL
      ======================================================== */}

      {showSectionModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-section-title"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-primary">
                  <BookOpen size={15} />
                  Curriculum
                </div>

                <h2
                  id="add-section-title"
                  className="mt-1 text-xl font-extrabold text-slate-900"
                >
                  Create New Section
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Organize your lessons into a clear learning path.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeSectionModal
                }
                disabled={
                  sectionSubmitting
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
                aria-label="Close section modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSectionCreate
              }
            >
              <div className="space-y-5 p-5 sm:p-6">

                {sectionFormError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3.5">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-red-500"
                    />

                    <p className="text-sm font-medium text-red-600">
                      {
                        sectionFormError
                      }
                    </p>
                  </div>
                )}

                <FormField
                  label="Section Title"
                  name="title"
                  value={
                    sectionFormData.title
                  }
                  onChange={
                    handleSectionChange
                  }
                  placeholder="e.g. Introduction to History"
                  required
                />

                <div>
                  <label
                    htmlFor="section-description"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="section-description"
                    name="description"
                    value={
                      sectionFormData.description
                    }
                    onChange={
                      handleSectionChange
                    }
                    rows={4}
                    placeholder="Briefly describe what students will learn in this section..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                {/* PREVIEW */}

                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                    Section Preview
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-extrabold text-primary shadow-sm">
                      {sections.length +
                        1}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-slate-900">
                        {sectionFormData.title ||
                          "Your section title"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        0 lessons
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={
                    closeSectionModal
                  }
                  disabled={
                    sectionSubmitting
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    sectionSubmitting
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-primary-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sectionSubmitting ? (
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
                      Create Section
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD LESSON MODAL
      ======================================================== */}

      {showLessonModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-lesson-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-primary">
                  <Video size={15} />
                  Course Content
                </div>

                <h2
                  id="add-lesson-title"
                  className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl"
                >
                  Add New Lesson
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add learning content to{" "}
                  <strong>
                    {courseDetails?.title ||
                      "this course"}
                  </strong>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeLessonModal
                }
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close lesson modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleLessonCreate
              }
            >
              <div className="space-y-5 p-5 sm:p-6">

                {/* FORM ERROR */}

                {formError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3.5">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-red-500"
                    />

                    <p className="text-sm font-medium text-red-600">
                      {formError}
                    </p>
                  </div>
                )}

                {/* SECTION */}

                <div>
                  <label
                    htmlFor="lesson-section"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Section
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="lesson-section"
                    name="sectionId"
                    value={
                      lessonFormData.sectionId
                    }
                    onChange={
                      handleLessonChange
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">
                      Select a section
                    </option>

                    {sortedSections.map(
                      (
                        section,
                        index
                      ) => (
                        <option
                          key={
                            section.id
                          }
                          value={
                            section.id
                          }
                        >
                          {index + 1}.{" "}
                          {
                            section.title
                          }
                        </option>
                      )
                    )}
                  </select>

                  {sections.length ===
                    0 && (
                    <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-3 py-2.5">
                      <p className="text-xs font-medium text-amber-700">
                        Create a section before adding lessons.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          closeLessonModal();
                          openSectionModal();
                        }}
                        className="shrink-0 text-xs font-extrabold text-primary hover:underline"
                      >
                        + Add Section
                      </button>
                    </div>
                  )}
                </div>

                {/* TITLE */}

                <FormField
                  label="Lesson Title"
                  name="title"
                  value={
                    lessonFormData.title
                  }
                  onChange={
                    handleLessonChange
                  }
                  placeholder="e.g. Introduction to Algorithms"
                  required
                />

                {/* VIDEO */}

                <FormField
                  label="Video URL"
                  name="videoUrl"
                  value={
                    lessonFormData.videoUrl
                  }
                  onChange={
                    handleLessonChange
                  }
                  placeholder="https://example.com/video"
                />

                {/* SUMMARY */}

                <div>
                  <label
                    htmlFor="lesson-summary"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Lesson Summary
                  </label>

                  <textarea
                    id="lesson-summary"
                    name="summary"
                    value={
                      lessonFormData.summary
                    }
                    onChange={
                      handleLessonChange
                    }
                    rows={5}
                    placeholder="Describe what students will learn..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                {/* INFORMATION */}

                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                      <BookOpen size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-extrabold text-slate-800">
                        Lesson publishing
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        New lessons are created as published content and will be associated with the selected section.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={
                    closeLessonModal
                  }
                  disabled={
                    submitting
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    sections.length ===
                      0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
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
                      Create Lesson
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

// ============================================================
// KPI CARD
// ============================================================

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
}) {
  const colorStyles = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      value: "text-slate-900",
    },

    violet: {
      icon: "bg-violet-50 text-violet-600",
      value: "text-slate-900",
    },

    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      value: "text-slate-900",
    },

    amber: {
      icon: "bg-amber-50 text-amber-600",
      value: "text-slate-900",
    },

    indigo: {
      icon: "bg-indigo-50 text-indigo-600",
      value: "text-slate-900",
    },
  };

  const styles =
    colorStyles[color] ||
    colorStyles.blue;

  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          {title}
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles.icon} transition group-hover:scale-105`}
        >
          <Icon size={19} />
        </div>
      </div>

      <div
        className={`mt-4 text-2xl font-extrabold tracking-tight ${styles.value}`}
      >
        {value}
      </div>

      <div className="mt-1 text-xs font-medium text-slate-400">
        {subtitle}
      </div>
    </div>
  );
}

// ============================================================
// TAB BUTTON
// ============================================================

function TabButton({
  active,
  onClick,
  label,
  icon: Icon,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={
        active ? "page" : undefined
      }
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-primary/20 ${
        active
          ? "bg-blue-50 text-primary shadow-sm"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  const normalizedStatus = String(
    status || "active"
  ).toLowerCase();

  const styles = {
    published:
      "bg-emerald-50 text-emerald-700 border-emerald-100",

    active:
      "bg-emerald-50 text-emerald-700 border-emerald-100",

    draft:
      "bg-amber-50 text-amber-700 border-amber-100",

    archived:
      "bg-slate-100 text-slate-600 border-slate-200",

    closed:
      "bg-red-50 text-red-700 border-red-100",

    pending:
      "bg-amber-50 text-amber-700 border-amber-100",
  };

  const className =
    styles[normalizedStatus] ||
    "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${className}`}
    >
      {status || "active"}
    </span>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100">
        <Icon size={25} />
      </div>

      <h3 className="mt-4 text-base font-extrabold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      {buttonText && (
        <button
          type="button"
          onClick={onClick}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <Plus size={16} />
          {buttonText}
        </button>
      )}
    </div>
  );
}

// ============================================================
// QUIZ STAT
// ============================================================

function QuizStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-500">
          {label}
        </span>

        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
          <Icon size={15} />
        </span>
      </div>

      <div className="mt-2 text-lg font-extrabold text-slate-900">
        {value}
      </div>
    </div>
  );
}

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
  label,
  value,
  last = false,
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 ${
        !last
          ? "border-b border-slate-100"
          : ""
      }`}
    >
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <strong className="text-right text-sm font-bold text-slate-800">
        {value}
      </strong>
    </div>
  );
}

// ============================================================
// QUICK ACTION
// ============================================================

function QuickAction({
  icon: Icon,
  label,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3 text-left text-sm font-bold text-slate-700 outline-none transition hover:border-slate-200 hover:bg-white hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
        <Icon size={16} />
      </span>

      <span className="flex-1">
        {label}
      </span>

      <ChevronRight
        size={16}
        className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </button>
  );
}

// ============================================================
// FORM FIELD
// ============================================================

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </div>
  );
}

export default CourseWorkspace;