import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Bookmark,
  Share2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import VideoPlayer from "@components/learning/VideoPlayer";
import ChapterAccordion from "@components/learning/ChapterAccordion";
import NotesPanel from "@components/learning/NotesPanel";
import QuizPanel from "@components/learning/QuizPanel";
import DiscussionPanel from "@components/learning/DiscussionPanel";

import { copyToClipboard } from "@utils/sharing";
import { apiRequest } from "@services/api";

const TABS = [
  "Overview",
  "Notes",
  "Transcript",
  "Discussion",
  "Resources",
  "Quiz",
];

export default function LessonPlayer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState(null);

  const [
    completedLessonIds,
    setCompletedLessonIds,
  ] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [
    activeTab,
    setActiveTab,
  ] = useState("Overview");

  const [
    isBookmarked,
    setIsBookmarked,
  ] = useState(false);

  const [
    copyStatus,
    setCopyStatus,
  ] = useState("idle");

  const [
    isSavingProgress,
    setIsSavingProgress,
  ] = useState(false);

  const [
    completed,
    setCompleted,
  ] = useState(false);

  const [
    videoState,
    setVideoState,
  ] = useState({
    currentSeconds: 0,
    durationSeconds: 0,
    isPlaying: false,
    isMuted: false,
    playbackRate: 1,
  });

  const lastSavedTimeRef =
    useRef(0);

  // =====================================================
  // LOAD LESSON
  // =====================================================

  async function loadLesson() {
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

      const lessonData =
        await apiRequest(
          `/lessons/${lessonId}`,
          { token }
        );

      setLesson(lessonData);

      // -------------------------------------------------
      // CURRENT LESSON PROGRESS
      // -------------------------------------------------

      let currentProgress = null;

      try {
        currentProgress =
          await apiRequest(
            `/progress/lesson/${lessonId}`,
            { token }
          );
      } catch (progressError) {
        if (
          progressError?.message !==
          "Lesson progress not found"
        ) {
          console.warn(
            "Progress load error:",
            progressError
          );
        }
      }

      setProgress(currentProgress);

      setCompleted(
        Boolean(
          currentProgress?.completed
        )
      );

      // -------------------------------------------------
      // ALL PROGRESS
      // -------------------------------------------------

      const allProgress =
        await apiRequest(
          "/progress/my",
          { token }
        );

      const progressRows =
        Array.isArray(allProgress)
          ? allProgress
          : [];

      setCompletedLessonIds(
        new Set(
          progressRows
            .filter(
              (item) =>
                Boolean(
                  item.completed
                )
            )
            .map((item) =>
              Number(
                item.lesson_id
              )
            )
        )
      );

      // -------------------------------------------------
      // COURSE SECTIONS
      // -------------------------------------------------

      const sectionsData =
        await apiRequest(
          `/course-sections/course/${lessonData.course_id}`,
          { token }
        );

      const rawSections =
        Array.isArray(sectionsData)
          ? sectionsData
          : [];

      const sectionsWithLessons =
        await Promise.all(
          rawSections.map(
            async (section) => {
              try {
                const lessons =
                  await apiRequest(
                    `/lessons/section/${section.id}`,
                    { token }
                  );

                return {
                  ...section,
                  lessons:
                    Array.isArray(lessons)
                      ? lessons
                      : [],
                };
              } catch (err) {
                console.error(
                  "Section lessons error:",
                  err
                );

                return {
                  ...section,
                  lessons: [],
                };
              }
            }
          )
        );

      setSections(
        sectionsWithLessons
      );
    } catch (err) {
      console.error(
        "Lesson player error:",
        err
      );

      setError(
        err.message ||
          "Failed to load lesson."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  // =====================================================
  // ALL LESSONS
  // =====================================================

  const allLessons = useMemo(
    () =>
      sections.flatMap(
        (section) =>
          (
            section.lessons ||
            []
          ).map((item) => ({
            ...item,
            sectionTitle:
              section.title,
          }))
      ),
    [sections]
  );

  const currentIndex =
    allLessons.findIndex(
      (item) =>
        Number(item.id) ===
        Number(lessonId)
    );

  const previousLesson =
    currentIndex > 0
      ? allLessons[
          currentIndex - 1
        ]
      : null;

  const nextLesson =
    currentIndex >= 0 &&
    currentIndex <
      allLessons.length - 1
      ? allLessons[
          currentIndex + 1
        ]
      : null;

  // =====================================================
  // SAVE PROGRESS
  // =====================================================

  async function saveProgress(
    seconds,
    force = false
  ) {
    if (!lesson) return;

    const token =
      localStorage.getItem(
        "osta_token"
      );

    if (!token) return;

    const rounded =
      Math.floor(
        Number(seconds) || 0
      );

    if (
      !force &&
      Math.abs(
        rounded -
          lastSavedTimeRef.current
      ) < 5
    ) {
      return;
    }

    try {
      setIsSavingProgress(true);

      const duration =
        Number(
          videoState.durationSeconds
        ) ||
        Number(
          lesson.duration_minutes
        ) *
          60 ||
        0;

      const percentage =
        duration > 0
          ? Math.min(
              100,
              Math.round(
                (rounded /
                  duration) *
                  100
              )
            )
          : 0;

     const response = await apiRequest(
  `/progress/lesson/${lesson.id}`,
  {
    token,
    method: "PUT",
    body: {
      progressPercent: percentage,
      lastPositionSeconds: rounded,
      completed: percentage >= 100 || completed,
    },
  }
);

if (response?.progress) {
  setProgress(response.progress);
}

      lastSavedTimeRef.current =
        rounded;

      if (
        percentage >= 100 ||
        completed
      ) {
        setCompletedLessonIds(
          (previous) => {
            const next =
              new Set(previous);

            next.add(
              Number(lesson.id)
            );

            return next;
          }
        );
      }
    } catch (err) {
      console.error(
        "Save progress error:",
        err
      );
    } finally {
      setIsSavingProgress(
        false
      );
    }
  }

  // =====================================================
  // AUTO SAVE PROGRESS
  // =====================================================

  useEffect(() => {
    if (
      !lesson ||
      !videoState.isPlaying
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        saveProgress(
          videoState.currentSeconds
        );
      }, 5000);

    return () =>
      clearTimeout(timer);
  }, [
    lesson,
    videoState.currentSeconds,
    videoState.isPlaying,
  ]);

  // =====================================================
  // COMPLETE LESSON
  // =====================================================

  async function handleCompleteLesson() {
    try {
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
        `/progress/lesson/${lesson.id}/complete`,
        {
          token,
          method: "PUT",
        }
      );

      setCompleted(true);

      setCompletedLessonIds(
        (previous) => {
          const next =
            new Set(previous);

          next.add(
            Number(lesson.id)
          );

          return next;
        }
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to complete lesson."
      );
    }
  }

  // =====================================================
  // SHARE
  // =====================================================

  async function handleShare() {
    const success =
      await copyToClipboard(
        window.location.href
      );

    setCopyStatus(
      success
        ? "copied"
        : "error"
    );

    setTimeout(() => {
      setCopyStatus("idle");
    }, 1800);
  }

  // =====================================================
  // BACK
  // =====================================================

  function goBack() {
    if (lesson?.course_id) {
      navigate(
        `/courses/${lesson.course_id}`
      );
    } else {
      navigate(
        "/my-learning"
      );
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <div className="rounded-2xl bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Loading lesson...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !lesson) {
    return (
      <div className="mx-auto max-w-[600px] px-5 py-16 text-center">
        <AlertCircle
          size={35}
          className="mx-auto text-red-500"
        />

        <h1 className="mt-4 text-xl font-bold text-ink">
          Lesson could not be loaded
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {error}
        </p>

        <button
          type="button"
          onClick={loadLesson}
          className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  const progressPercent =
    videoState.durationSeconds >
    0
      ? Math.min(
          100,
          (videoState.currentSeconds /
            videoState.durationSeconds) *
            100
        )
      : Number(
          progress?.progress_percent
        ) || 0;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-8">
      {/* BACK */}

      <button
        type="button"
        onClick={goBack}
        className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Course
      </button>

      {/* CURRICULUM */}

      <div className="mb-6">
        <h2 className="mb-3 text-lg font-bold text-ink">
          Course Curriculum
        </h2>

        <ChapterAccordion
          chapters={sections}
          activeLessonId={Number(
            lessonId
          )}
          completedLessonIds={
            completedLessonIds
          }
        />
      </div>

      {/* LESSON */}

      <div className="grid gap-6 lg:grid-cols-[1.7fr_320px]">
        <div className="space-y-4">
          {/* VIDEO */}

          <VideoPlayer
            videoUrl={
              lesson.video_url
            }
            title={lesson.title}
            durationMinutes={
              lesson.duration_minutes
            }
            initialPosition={
              Number(
                progress?.last_position_seconds
              ) || 0
            }
            onStateChange={
              setVideoState
            }
            onComplete={
              handleCompleteLesson
            }
          />

          {/* LESSON HEADER */}

          <section className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-lg font-bold text-ink">
                  {lesson.title}
                </h1>

                <p className="mt-1 text-xs text-slate-400">
                  {Math.round(
                    progressPercent
                  )}
                  % watched
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setIsBookmarked(
                      (value) =>
                        !value
                    )
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                >
                  <Bookmark
                    size={15}
                  />
                </button>

                <button
                  type="button"
                  onClick={
                    handleShare
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                >
                  <Share2
                    size={15}
                  />
                </button>
              </div>
            </div>

            {copyStatus ===
              "copied" && (
              <p className="mt-2 text-right text-xs text-green-600">
                Link copied.
              </p>
            )}

            {isSavingProgress && (
              <p className="mt-2 text-right text-xs text-slate-400">
                Saving progress...
              </p>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-400">
                {lesson.section_title}
              </span>

              <button
                type="button"
                onClick={
                  handleCompleteLesson
                }
                disabled={completed}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${
                  completed
                    ? "bg-primary-light text-primary"
                    : "bg-primary text-white hover:bg-primary-hover"
                }`}
              >
                <CheckCircle2
                  size={14}
                />

                {completed
                  ? "Completed"
                  : "Mark Complete"}
              </button>
            </div>
          </section>

          {/* TABS */}

          <section className="rounded-xl border border-slate-100 bg-white">
            <nav className="flex gap-5 overflow-x-auto border-b border-slate-200 px-5">
              {TABS.map(
                (tab) => (
                  <button
                    type="button"
                    key={tab}
                    onClick={() =>
                      setActiveTab(
                        tab
                      )
                    }
                    className={`border-b-2 py-3 text-xs font-semibold ${
                      activeTab ===
                      tab
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </nav>

            {/* OVERVIEW */}

            {activeTab ===
              "Overview" && (
              <div className="p-5">
                <h2 className="text-sm font-bold text-ink">
                  About this lesson
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {lesson.description ||
                    "No description available."}
                </p>
              </div>
            )}

            {/* NOTES */}

            {activeTab ===
              "Notes" && (
              <NotesPanel
                lessonId={lesson.id}
                currentSeconds={
                  videoState.currentSeconds
                }
              />
            )}

            {/* TRANSCRIPT */}

            {activeTab ===
              "Transcript" && (
              <div className="p-5">
                <h2 className="text-sm font-bold text-ink">
                  Transcript
                </h2>

                {lesson.transcript ? (
                  <div className="mt-4 whitespace-pre-line rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                    {lesson.transcript}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">
                    No transcript has been added to this lesson yet.
                  </p>
                )}
              </div>
            )}

            {/* DISCUSSION */}

            {activeTab ===
              "Discussion" && (
              <DiscussionPanel
                lesson={lesson}
              />
            )}

            {/* RESOURCES */}

            {activeTab ===
              "Resources" && (
              <div className="p-5">
                <h2 className="text-sm font-bold text-ink">
                  Lesson Resources
                </h2>

                {lesson.resource_url ? (
                  <a
                    href={
                      lesson.resource_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover"
                  >
                    Open Resource
                  </a>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">
                    No resources have been added yet.
                  </p>
                )}
              </div>
            )}

            {/* QUIZ */}

            {activeTab ===
              "Quiz" && (
              <QuizPanel
                courseId={
                  lesson.course_id
                }
                lessonId={
                  lesson.id
                }
              />
            )}
          </section>

          {/* NAVIGATION */}

          <div className="flex gap-3">
            {previousLesson && (
              <Link
                to={`/learn/${previousLesson.id}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                <ChevronRight
                  size={15}
                  className="rotate-180"
                />
                Previous
              </Link>
            )}

            {nextLesson ? (
              <Link
                to={`/learn/${nextLesson.id}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-white hover:bg-primary-hover"
              >
                Next Lesson
                <ChevronRight
                  size={15}
                />
              </Link>
            ) : (
              <Link
                to={`/courses/${lesson.course_id}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-white hover:bg-primary-hover"
              >
                Back to Course
                <ChevronRight
                  size={15}
                />
              </Link>
            )}
          </div>
        </div>

        {/* LESSON INFO */}

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <h3 className="text-sm font-bold text-ink">
              Lesson Information
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">
                  Duration
                </span>

                <span className="font-semibold text-slate-600">
                  {lesson.duration_minutes}{" "}
                  min
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-slate-400">
                  Progress
                </span>

                <span className="font-semibold text-primary">
                  {Math.round(
                    progressPercent
                  )}
                  %
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-slate-400">
                  Status
                </span>

                <span className="font-semibold text-slate-600">
                  {completed
                    ? "Completed"
                    : "In Progress"}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}