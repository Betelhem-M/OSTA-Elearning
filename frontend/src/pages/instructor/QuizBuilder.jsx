import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  FileText,
  GripVertical,
  Info,
  Loader2,
  Plus,
  Save,
  Shuffle,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import {
  createQuiz,
  getQuizById,
  updateQuiz,
  publishQuiz,
} from "../../services/quizApi";
import api from "../../services/api";

const createEmptyOption = (key) => ({
  optionKey: key,
  optionText: "",
  isCorrect: false,
});

const createEmptyQuestion = () => ({
  prompt: "",
  questionType: "multiple_choice",
  code: "",
  difficulty: "Easy",
  points: 1,
  explanation: "",
  options: [
    createEmptyOption("A"),
    createEmptyOption("B"),
    createEmptyOption("C"),
    createEmptyOption("D"),
  ],
});

const EMPTY_COURSES = [];

const EMPTY_QUIZ = {
  courseId: "",
  lessonId: "",
  title: "",
  description: "",
  timeLimitMinutes: 30,
  passPercent: 70,
  shuffleQuestions: false,
  questions: [createEmptyQuestion()],
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const normalizeArrayResponse = (response, key) => {
  const body = response?.data;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.[key])) return body[key];
  if (Array.isArray(body?.courses)) return body.courses;
  if (Array.isArray(body?.data?.[key])) return body.data[key];
  if (Array.isArray(body?.data?.courses)) return body.data.courses;
  if (Array.isArray(body?.results)) return body.results;

  return [];
};

function QuizBuilder({ quizId: quizIdProp = null, courses: coursesProp = EMPTY_COURSES }) {
  const { quizId: routeQuizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Route params take priority. This fixes the previous issue where
  // QuizBuilder rendered from App.jsx never received quizId as a prop.
  const quizId = quizIdProp || routeQuizId || null;

  const initialCourseId =
    location.state?.courseId ||
    location.state?.course?.id ||
    "";

  const [quiz, setQuiz] = useState({
    ...EMPTY_QUIZ,
    courseId: initialCourseId,
  });

  const [courses, setCourses] = useState(coursesProp || []);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [loading, setLoading] = useState(Boolean(quizId));
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const isEditing = Boolean(quizId);

  // ==========================================================
  // LOAD COURSES
  // ==========================================================
  useEffect(() => {
    let cancelled = false;
    const providedCourses = Array.isArray(coursesProp) ? coursesProp : [];

    // If the parent already supplied courses, use them and stop loading.
    if (providedCourses.length > 0) {
      setCourses(providedCourses);
      setCoursesLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const loadCourses = async () => {
      setCoursesLoading(true);
      setError("");

      try {
        const response = await api.get("/courses/instructor");

        const items = normalizeArrayResponse(response, "courses")
          .filter(Boolean)
          .map((course) => ({
            ...course,
            id: course.id ?? course.course_id ?? course.courseId,
            title:
              course.title ??
              course.course_title ??
              course.name ??
              `Course ${course.id ?? course.course_id ?? ""}`,
          }))
          .filter((course) => course.id != null);

        if (cancelled) return;

        setCourses(items);

        if (!items.length && initialCourseId) {
          setSuccess(
            "The selected course is ready. You can continue building the quiz."
          );
        }
      } catch (err) {
        if (cancelled) return;

        console.warn("Could not load instructor courses:", err);

        const status = err?.response?.status;
        const serverMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error;

        setCourses([]);

        if (initialCourseId) {
          setError(
            serverMessage ||
              (status === 401
                ? "Your session has expired. Please sign in again."
                : status === 403
                  ? "You do not have permission to manage instructor courses."
                  : "Could not load the course list. The selected course can still be used.")
          );
        } else {
          setError(
            serverMessage ||
              (status === 401
                ? "Your session has expired. Please sign in again."
                : status === 403
                  ? "Your account is not authorized to manage quizzes."
                  : "Could not load your courses. Please retry.")
          );
        }
      } finally {
        if (!cancelled) {
          setCoursesLoading(false);
        }
      }
    };

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, [coursesProp, initialCourseId]);

  // ==========================================================
  // LOAD EXISTING QUIZ
  // ==========================================================

  useEffect(() => {
    if (!quizId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const response = await getQuizById(quizId);
        const data = response?.data?.quiz || response?.data?.data || response?.data;

        if (cancelled || !data) return;

        const loadedQuestions =
          data.questions?.map((question) => ({
            id: question.id,
            prompt: question.prompt || "",
            questionType:
              question.question_type || "multiple_choice",
            code: question.code || "",
            difficulty: question.difficulty || "Easy",
            points: Number(question.points) || 1,
            explanation: question.explanation || "",
            options:
              question.options?.length
                ? question.options.map((option) => ({
                    id: option.id,
                    optionKey:
                      option.option_key || option.optionKey,
                    optionText:
                      option.option_text || option.optionText || "",
                    isCorrect: Boolean(
                      option.is_correct ?? option.isCorrect
                    ),
                  }))
                : [
                    createEmptyOption("A"),
                    createEmptyOption("B"),
                    createEmptyOption("C"),
                    createEmptyOption("D"),
                  ],
          })) || [createEmptyQuestion()];

        setQuiz({
          courseId: data.course_id ?? data.courseId ?? "",
          lessonId: data.lesson_id ?? data.lessonId ?? "",
          title: data.title || "",
          description: data.description || "",
          timeLimitMinutes:
            data.time_limit_minutes ?? data.timeLimitMinutes ?? 30,
          passPercent: Number(
            data.pass_percent ?? data.passPercent ?? 70
          ),
          shuffleQuestions: Boolean(
            data.shuffle_questions ?? data.shuffleQuestions
          ),
          questions: loadedQuestions,
        });

        setActiveQuestion(0);
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load quiz."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadQuiz();

    return () => {
      cancelled = true;
    };
  }, [quizId]);

  // ==========================================================
  // FIELD HELPERS
  // ==========================================================

  const updateField = (field, value) => {
    setQuiz((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  const updateQuestion = (questionIndex, field, value) => {
    setQuiz((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex
          ? { ...question, [field]: value }
          : question
      ),
    }));

    if (error) setError("");
  };

  const updateOption = (
    questionIndex,
    optionIndex,
    field,
    value
  ) => {
    setQuiz((current) => ({
      ...current,
      questions: current.questions.map((question, qIndex) => {
        if (qIndex !== questionIndex) return question;

        return {
          ...question,
          options: question.options.map((option, oIndex) =>
            oIndex === optionIndex
              ? { ...option, [field]: value }
              : option
          ),
        };
      }),
    }));

    if (error) setError("");
  };

  const setCorrectOption = (questionIndex, optionIndex) => {
    setQuiz((current) => ({
      ...current,
      questions: current.questions.map((question, qIndex) => {
        if (qIndex !== questionIndex) return question;

        return {
          ...question,
          options: question.options.map((option, oIndex) => ({
            ...option,
            isCorrect: oIndex === optionIndex,
          })),
        };
      }),
    }));

    if (error) setError("");
  };

  // ==========================================================
  // QUESTION MANAGEMENT
  // ==========================================================

  const addQuestion = () => {
    setQuiz((current) => ({
      ...current,
      questions: [...current.questions, createEmptyQuestion()],
    }));

    setActiveQuestion(quiz.questions.length);
  };

  const removeQuestion = (questionIndex) => {
    if (quiz.questions.length === 1) {
      setError("A quiz must contain at least one question.");
      return;
    }

    setQuiz((current) => ({
      ...current,
      questions: current.questions.filter(
        (_, index) => index !== questionIndex
      ),
    }));

    setActiveQuestion((current) =>
      Math.max(0, Math.min(current, quiz.questions.length - 2))
    );
  };

  const duplicateQuestion = (questionIndex) => {
    const source = quiz.questions[questionIndex];

    const duplicate = {
      ...source,
      id: undefined,
      prompt: `${source.prompt}`,
      options: source.options.map((option) => ({
        ...option,
        id: undefined,
      })),
    };

    setQuiz((current) => ({
      ...current,
      questions: [
        ...current.questions.slice(0, questionIndex + 1),
        duplicate,
        ...current.questions.slice(questionIndex + 1),
      ],
    }));

    setActiveQuestion(questionIndex + 1);
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateQuiz = () => {
    if (!quiz.courseId) return "Please select a course.";

    if (!quiz.title.trim()) return "Quiz title is required.";

    const passPercent = Number(quiz.passPercent);

    if (
      Number.isNaN(passPercent) ||
      passPercent < 0 ||
      passPercent > 100
    ) {
      return "Passing score must be between 0 and 100.";
    }

    if (!quiz.questions.length) {
      return "Add at least one question.";
    }

    for (let i = 0; i < quiz.questions.length; i += 1) {
      const question = quiz.questions[i];

      if (!question.prompt.trim()) {
        return `Question ${i + 1} requires a prompt.`;
      }

      if (Number(question.points) <= 0) {
        return `Question ${i + 1} must have positive points.`;
      }

      if (question.options.length < 2) {
        return `Question ${i + 1} needs at least two options.`;
      }

      const emptyOption = question.options.find(
        (option) => !option.optionText.trim()
      );

      if (emptyOption) {
        return `Question ${i + 1} contains an empty answer option.`;
      }

      const correctCount = question.options.filter(
        (option) => option.isCorrect
      ).length;

      if (correctCount !== 1) {
        return `Question ${i + 1} must have exactly one correct answer.`;
      }
    }

    return null;
  };

  // ==========================================================
  // SAVE
  // ==========================================================

  const buildPayload = () => ({
    courseId: Number(quiz.courseId),
    lessonId: quiz.lessonId ? Number(quiz.lessonId) : null,
    title: quiz.title.trim(),
    description: quiz.description.trim(),
    timeLimitMinutes: quiz.timeLimitMinutes
      ? Number(quiz.timeLimitMinutes)
      : null,
    passPercent: Number(quiz.passPercent),
    shuffleQuestions: Boolean(quiz.shuffleQuestions),
    questions: quiz.questions.map((question) => ({
      ...question,
      points: Number(question.points),
      options: question.options.map((option) => ({
        ...option,
        optionText: option.optionText.trim(),
      })),
    })),
  });

  const handleSave = async () => {
    const validation = validateQuiz();

    if (validation) {
      setError(validation);
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = buildPayload();

      const response = isEditing
        ? await updateQuiz(quizId, payload)
        : await createQuiz(payload);

      const createdQuiz =
        response?.data?.quiz ||
        response?.data?.data ||
        response?.quiz ||
        response?.data;

      const savedId =
        createdQuiz?.id ||
        response?.quizId ||
        response?.id;

      setSuccess(
        response?.message ||
          (isEditing
            ? "Quiz changes saved successfully."
            : "Quiz draft created successfully.")
      );

      // A newly-created draft can now be published because the route
      // changes to the real quiz ID.
      if (!isEditing && savedId) {
        navigate(`/instructor/quizzes/${savedId}/edit`, {
          replace: true,
          state: {
            courseId: quiz.courseId,
          },
        });
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save quiz."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // PUBLISH
  // ==========================================================

  const handlePublish = async () => {
    const validation = validateQuiz();

    if (validation) {
      setError(validation);
      setSuccess("");
      return;
    }

    if (!quizId) {
      setError("Save the quiz as a draft before publishing.");
      return;
    }

    try {
      setPublishing(true);
      setError("");
      setSuccess("");

      const response = await publishQuiz(quizId);

      setSuccess(
        response?.message || "Quiz published successfully."
      );
    } catch (err) {
      const data = err?.response?.data;

      const serverErrors = data?.errors
        ? Array.isArray(data.errors)
          ? data.errors.join(" ")
          : Object.values(data.errors).join(" ")
        : "";

      setError(
        serverErrors ||
          data?.message ||
          err?.message ||
          "Failed to publish quiz."
      );
    } finally {
      setPublishing(false);
    }
  };

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalPoints = useMemo(
    () =>
      quiz.questions.reduce(
        (total, question) =>
          total + Number(question.points || 0),
        0
      ),
    [quiz.questions]
  );

  const answeredQuestions = useMemo(
    () =>
      quiz.questions.filter(
        (question) =>
          question.prompt.trim() &&
          question.options.some((option) => option.isCorrect)
      ).length,
    [quiz.questions]
  );

  const selectedCourse = useMemo(
    () =>
      courses.find(
        (course) =>
          Number(course.id) === Number(quiz.courseId)
      ),
    [courses, quiz.courseId]
  );

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Loader2 className="animate-spin" size={25} />
          </div>
          <h2 className="mt-5 text-lg font-extrabold text-slate-900">
            Loading quiz
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Preparing the quiz builder...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  quiz.courseId
                    ? `/instructor/courses/${quiz.courseId}`
                    : "/instructor/courses"
                )
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Back to course"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="hidden rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 sm:inline-flex">
                  Instructor
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {isEditing ? "Edit quiz" : "New quiz"}
                </span>
              </div>

              <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                {quiz.title || "Quiz Builder"}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              disabled={!quiz.title.trim()}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex"
            >
              <BookOpen size={16} />
              Preview
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || publishing}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span className="hidden sm:inline">
                {saving ? "Saving..." : "Save Draft"}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || saving || !quizId}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              <span className="hidden sm:inline">
                {publishing ? "Publishing..." : "Publish"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* PAGE INTRO */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-blue-600">
            Assessment authoring
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Build a quiz your students can trust.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Configure the quiz, write clear questions, select the correct
            answers, and publish when everything is ready.
          </p>
        </div>

        {/* ALERTS */}
        {(error || success) && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
              error
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {error ? (
              <X size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                {error ? "Unable to continue" : "Success"}
              </p>
              <p className="mt-0.5 whitespace-pre-line text-sm leading-6 opacity-90">
                {error || success}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
              }}
              className="rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
              aria-label="Dismiss message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            {/* QUIZ SETTINGS */}
            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-950">
                      Quiz settings
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Define the quiz details and assessment rules.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <label
                    htmlFor="quiz-title"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Quiz title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quiz-title"
                    type="text"
                    value={quiz.title}
                    onChange={(e) =>
                      updateField("title", e.target.value)
                    }
                    placeholder="e.g. JavaScript Fundamentals Quiz"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="quiz-description"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Description
                  </label>
                  <textarea
                    id="quiz-description"
                    rows={4}
                    value={quiz.description}
                    onChange={(e) =>
                      updateField("description", e.target.value)
                    }
                    placeholder="Tell students what this quiz covers and what they should prepare for."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="quiz-course"
                      className="mb-2 block text-sm font-bold text-slate-800"
                    >
                      Course <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      {coursesLoading && (
                        <Loader2
                          size={16}
                          className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 animate-spin text-blue-500"
                          aria-hidden="true"
                        />
                      )}

                      <select
                        id="quiz-course"
                        value={quiz.courseId}
                        onChange={(e) =>
                          updateField("courseId", e.target.value)
                        }
                        disabled={coursesLoading || isEditing}
                        className={`h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/60 px-4 pr-10 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-70 ${
                          coursesLoading ? "pl-10" : ""
                        }`}
                      >
                        <option value="">
                          {coursesLoading
                            ? "Loading your courses..."
                            : courses.length
                              ? "Select a course"
                              : "No courses available"}
                        </option>

                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title || `Course #${course.id}`}
                          </option>
                        ))}

                        {quiz.courseId &&
                          !courses.some(
                            (course) =>
                              Number(course.id) === Number(quiz.courseId)
                          ) && (
                            <option value={quiz.courseId}>
                              {selectedCourse?.title ||
                                `Selected course #${quiz.courseId}`}
                            </option>
                          )}
                      </select>
                      <ChevronDown
                        size={17}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>

                    {isEditing && selectedCourse && (
                      <p className="mt-2 text-xs text-slate-400">
                        Course is locked while editing this quiz.
                      </p>
                    )}

                    {!coursesLoading && !courses.length && !quiz.courseId && (
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-amber-900">
                            No instructor courses found
                          </p>
                          <p className="mt-0.5 text-[11px] leading-4 text-amber-700">
                            Create or assign a course before creating a quiz.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => window.location.reload()}
                          className="shrink-0 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-amber-800 transition hover:bg-amber-100"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="quiz-lesson"
                      className="mb-2 block text-sm font-bold text-slate-800"
                    >
                      Lesson
                    </label>
                    <input
                      id="quiz-lesson"
                      type="number"
                      min="1"
                      value={quiz.lessonId}
                      onChange={(e) =>
                        updateField("lessonId", e.target.value)
                      }
                      placeholder="Optional lesson ID"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="time-limit"
                      className="mb-2 block text-sm font-bold text-slate-800"
                    >
                      Time limit
                    </label>
                    <div className="relative">
                      <Clock3
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="time-limit"
                        type="number"
                        min="1"
                        value={quiz.timeLimitMinutes}
                        onChange={(e) =>
                          updateField(
                            "timeLimitMinutes",
                            e.target.value
                          )
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-14 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        min
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="pass-percent"
                      className="mb-2 block text-sm font-bold text-slate-800"
                    >
                      Passing score
                    </label>
                    <div className="relative">
                      <input
                        id="pass-percent"
                        type="number"
                        min="0"
                        max="100"
                        value={quiz.passPercent}
                        onChange={(e) =>
                          updateField(
                            "passPercent",
                            e.target.value
                          )
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 pr-10 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        %
                      </span>
                    </div>
                  </div>

                  <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 transition hover:border-blue-200 hover:bg-blue-50/40">
                    <input
                      type="checkbox"
                      checked={quiz.shuffleQuestions}
                      onChange={(e) =>
                        updateField(
                          "shuffleQuestions",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Shuffle size={16} className="text-blue-500" />
                      Shuffle questions
                    </span>
                  </label>
                </div>
              </div>
            </section>

            {/* QUESTIONS */}
            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-950">
                    Questions
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Add clear questions and mark one correct answer for
                    each question.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  <Plus size={17} />
                  Add Question
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)]">
                {/* QUESTION NAVIGATION */}
                <aside className="border-b border-slate-100 bg-slate-50/60 p-3 lg:border-b-0 lg:border-r">
                  <div className="mb-2 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Question list
                  </div>

                  <div className="space-y-1.5">
                    {quiz.questions.map((question, index) => {
                      const complete =
                        Boolean(question.prompt.trim()) &&
                        question.options.every((option) =>
                          option.optionText.trim()
                        ) &&
                        question.options.some(
                          (option) => option.isCorrect
                        );

                      return (
                        <button
                          key={question.id || `question-${index}`}
                          type="button"
                          onClick={() => setActiveQuestion(index)}
                          className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                            activeQuestion === index
                              ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-100"
                              : "text-slate-600 hover:bg-white hover:text-slate-900"
                          }`}
                        >
                          <GripVertical
                            size={14}
                            className="shrink-0 text-slate-300"
                          />

                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                              activeQuestion === index
                                ? "bg-blue-600 text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {index + 1}
                          </span>

                          <span className="min-w-0 flex-1 truncate text-xs font-bold">
                            {question.prompt.trim() ||
                              `Question ${index + 1}`}
                          </span>

                          {complete && (
                            <Check
                              size={15}
                              className="shrink-0 text-emerald-500"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </aside>

                {/* ACTIVE QUESTION */}
                <div className="min-w-0 p-5 sm:p-6">
                  {quiz.questions.map((question, questionIndex) => {
                    if (questionIndex !== activeQuestion) return null;

                    return (
                      <div key={question.id || questionIndex}>
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-extrabold text-blue-700">
                              {questionIndex + 1}
                            </span>
                            <div>
                              <p className="text-sm font-extrabold text-slate-900">
                                Question {questionIndex + 1}
                              </p>
                              <p className="text-xs text-slate-400">
                                Multiple choice
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                duplicateQuestion(questionIndex)
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                              Duplicate
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                removeQuestion(questionIndex)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div>
                            <label
                              htmlFor={`prompt-${questionIndex}`}
                              className="mb-2 block text-sm font-bold text-slate-800"
                            >
                              Question prompt{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              id={`prompt-${questionIndex}`}
                              rows={4}
                              value={question.prompt}
                              onChange={(e) =>
                                updateQuestion(
                                  questionIndex,
                                  "prompt",
                                  e.target.value
                                )
                              }
                              placeholder="Write the question students will answer..."
                              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label
                                htmlFor={`difficulty-${questionIndex}`}
                                className="mb-2 block text-sm font-bold text-slate-800"
                              >
                                Difficulty
                              </label>
                              <div className="relative">
                                <select
                                  id={`difficulty-${questionIndex}`}
                                  value={question.difficulty}
                                  onChange={(e) =>
                                    updateQuestion(
                                      questionIndex,
                                      "difficulty",
                                      e.target.value
                                    )
                                  }
                                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 pr-9 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                >
                                  <option value="Easy">Easy</option>
                                  <option value="Medium">
                                    Medium
                                  </option>
                                  <option value="Hard">Hard</option>
                                </select>
                                <ChevronDown
                                  size={16}
                                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                              </div>
                            </div>

                            <div>
                              <label
                                htmlFor={`points-${questionIndex}`}
                                className="mb-2 block text-sm font-bold text-slate-800"
                              >
                                Points
                              </label>
                              <input
                                id={`points-${questionIndex}`}
                                type="number"
                                min="0.01"
                                step="0.5"
                                value={question.points}
                                onChange={(e) =>
                                  updateQuestion(
                                    questionIndex,
                                    "points",
                                    e.target.value
                                  )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                              />
                            </div>
                          </div>

                          {/* ANSWERS */}
                          <div>
                            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                              <div>
                                <p className="text-sm font-bold text-slate-800">
                                  Answer options
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  Select the radio button beside the correct
                                  answer.
                                </p>
                              </div>
                              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
                                <Check size={12} />
                                One correct answer
                              </span>
                            </div>

                            <div className="space-y-3">
                              {question.options.map(
                                (option, optionIndex) => (
                                  <div
                                    key={
                                      option.id ||
                                      `${questionIndex}-${option.optionKey}`
                                    }
                                    className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                                      option.isCorrect
                                        ? "border-emerald-200 bg-emerald-50/60"
                                        : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                                    }`}
                                  >
                                    <label className="flex shrink-0 cursor-pointer items-center">
                                      <input
                                        type="radio"
                                        name={`correct-${questionIndex}`}
                                        checked={
                                          option.isCorrect
                                        }
                                        onChange={() =>
                                          setCorrectOption(
                                            questionIndex,
                                            optionIndex
                                          )
                                        }
                                        className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                        aria-label={`Mark option ${option.optionKey} as correct`}
                                      />
                                    </label>

                                    <span
                                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                                        option.isCorrect
                                          ? "bg-emerald-600 text-white"
                                          : "bg-white text-slate-500 ring-1 ring-slate-200"
                                      }`}
                                    >
                                      {option.optionKey}
                                    </span>

                                    <input
                                      type="text"
                                      value={option.optionText}
                                      placeholder={`Answer option ${option.optionKey}`}
                                      onChange={(e) =>
                                        updateOption(
                                          questionIndex,
                                          optionIndex,
                                          "optionText",
                                          e.target.value
                                        )
                                      }
                                      className="h-10 min-w-0 flex-1 rounded-xl border-0 bg-transparent px-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20"
                                    />

                                    {option.isCorrect && (
                                      <span className="hidden shrink-0 text-xs font-extrabold text-emerald-700 sm:inline">
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* OPTIONAL CODE */}
                          <div>
                            <label
                              htmlFor={`code-${questionIndex}`}
                              className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"
                            >
                              <Code2 size={16} className="text-blue-600" />
                              Code snippet
                              <span className="text-xs font-medium text-slate-400">
                                Optional
                              </span>
                            </label>
                            <textarea
                              id={`code-${questionIndex}`}
                              rows={5}
                              value={question.code}
                              onChange={(e) =>
                                updateQuestion(
                                  questionIndex,
                                  "code",
                                  e.target.value
                                )
                              }
                              placeholder="// Add code here if the question requires it..."
                              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-xs leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                          </div>

                          {/* EXPLANATION */}
                          <div>
                            <label
                              htmlFor={`explanation-${questionIndex}`}
                              className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"
                            >
                              <Info size={16} className="text-blue-600" />
                              Answer explanation
                              <span className="text-xs font-medium text-slate-400">
                                Optional
                              </span>
                            </label>
                            <textarea
                              id={`explanation-${questionIndex}`}
                              rows={3}
                              value={question.explanation}
                              onChange={(e) =>
                                updateQuestion(
                                  questionIndex,
                                  "explanation",
                                  e.target.value
                                )
                              }
                              placeholder="Explain why the correct answer is right. This can help students learn from their result."
                              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                            />
                          </div>
                        </div>

                        {/* QUESTION FOOTER */}
                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                          <button
                            type="button"
                            disabled={questionIndex === 0}
                            onClick={() =>
                              setActiveQuestion(
                                Math.max(0, questionIndex - 1)
                              )
                            }
                            className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            ← Previous
                          </button>

                          <span className="text-xs font-semibold text-slate-400">
                            {questionIndex + 1} of{" "}
                            {quiz.questions.length}
                          </span>

                          <button
                            type="button"
                            disabled={
                              questionIndex ===
                              quiz.questions.length - 1
                            }
                            onClick={() =>
                              setActiveQuestion(
                                Math.min(
                                  quiz.questions.length - 1,
                                  questionIndex + 1
                                )
                              )
                            }
                            className="rounded-lg px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Quiz overview
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live summary
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Questions
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-950">
                    {quiz.questions.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Points
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-950">
                    {totalPoints}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Time
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-950">
                    {quiz.timeLimitMinutes || "—"}
                    <span className="ml-1 text-xs text-slate-400">
                      min
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Passing
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-950">
                    {quiz.passPercent}%
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">
                    Completion
                  </span>
                  <span className="text-slate-800">
                    {quiz.questions.length
                      ? Math.round(
                          (answeredQuestions /
                            quiz.questions.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${
                        quiz.questions.length
                          ? Math.round(
                              (answeredQuestions /
                                quiz.questions.length) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Info size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-blue-950">
                    Publishing checklist
                  </h3>
                  <ul className="mt-3 space-y-2.5 text-xs leading-5 text-blue-900/70">
                    <li className="flex gap-2">
                      <Check
                        size={14}
                        className={
                          quiz.title.trim()
                            ? "mt-0.5 shrink-0 text-emerald-600"
                            : "mt-0.5 shrink-0 text-slate-400"
                        }
                      />
                      Quiz title is provided
                    </li>
                    <li className="flex gap-2">
                      <Check
                        size={14}
                        className={
                          quiz.courseId
                            ? "mt-0.5 shrink-0 text-emerald-600"
                            : "mt-0.5 shrink-0 text-slate-400"
                        }
                      />
                      Course is selected
                    </li>
                    <li className="flex gap-2">
                      <Check
                        size={14}
                        className={
                          answeredQuestions ===
                          quiz.questions.length
                            ? "mt-0.5 shrink-0 text-emerald-600"
                            : "mt-0.5 shrink-0 text-slate-400"
                        }
                      />
                      Every question has a correct answer
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md sm:hidden"
            >
              <span>
                <span className="block text-sm font-extrabold text-slate-900">
                  Preview quiz
                </span>
                <span className="mt-1 block text-xs text-slate-400">
                  See how students will experience it.
                </span>
              </span>
              <BookOpen size={18} className="text-blue-600" />
            </button>
          </aside>
        </div>
      </main>

      {/* PREVIEW MODAL */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quiz-preview-title"
        >
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">
                  Student preview
                </p>
                <h2
                  id="quiz-preview-title"
                  className="mt-1 truncate text-lg font-extrabold text-slate-950"
                >
                  {quiz.title || "Untitled quiz"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                aria-label="Close preview"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 sm:p-7">
              {quiz.description && (
                <p className="mb-6 text-sm leading-6 text-slate-500">
                  {quiz.description}
                </p>
              )}

              <div className="mb-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  {quiz.questions.length} questions
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  {totalPoints} points
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  {quiz.timeLimitMinutes} minutes
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  Pass {quiz.passPercent}%
                </span>
              </div>

              <div className="space-y-5">
                {quiz.questions.map((question, index) => (
                  <article
                    key={question.id || index}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-extrabold text-blue-700">
                        {index + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold leading-6 text-slate-900">
                          {question.prompt || "Question prompt not provided."}
                        </p>

                        <div className="mt-4 space-y-2">
                          {question.options.map((option) => (
                            <div
                              key={option.optionKey}
                              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
                            >
                              <span className="text-xs font-extrabold text-slate-500">
                                {option.optionKey}
                              </span>
                              <span className="text-sm text-slate-700">
                                {option.optionText ||
                                  "Empty option"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizBuilder;
