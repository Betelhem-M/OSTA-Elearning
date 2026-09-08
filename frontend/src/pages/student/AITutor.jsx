import { useEffect, useMemo, useState } from "react";
import { Bot, Send, Sparkles, BookOpen, Loader2 } from "lucide-react";

import { apiRequest } from "@services/api";
import { useAuth } from "@context/AuthContext";
import { useLanguage } from "@context/LanguageContext";

const copy = {
  en: {
    title: "OSTA AI Tutor",
    subtitle: "Ask questions about your enrolled course and get guidance in your OSTA language.",
    course: "Course",
    lesson: "Lesson",
    allLessons: "Course-wide",
    selectCourse: "Select a course",
    question: "Ask your tutor...",
    send: "Send",
    thinking: "Thinking...",
    empty: "Your AI Tutor will use the selected course and lesson as context.",
    signIn: "Please sign in to use the AI Tutor.",
    noCourses: "You need to be enrolled in a course before using the AI Tutor.",
    loadError: "Unable to load your courses.",
    tutorError: "The AI Tutor could not answer right now.",
  },
  am: {
    title: "የኦስታ ኤአይ አስተማሪ",
    subtitle: "ስለ ተመዘገቡበት ኮርስ ጥያቄ ይጠይቁ፤ መልሱም በኦስታ የቋንቋ ምርጫዎ ይመጣል።",
    course: "ኮርስ",
    lesson: "ትምህርት",
    allLessons: "ሙሉ ኮርስ",
    selectCourse: "ኮርስ ይምረጡ",
    question: "አስተማሪዎን ይጠይቁ...",
    send: "ላክ",
    thinking: "በማሰብ ላይ...",
    empty: "ኤአይ አስተማሪው የመረጡትን ኮርስ እና ትምህርት እንደ አውድ ይጠቀማል።",
    signIn: "ኤአይ አስተማሪን ለመጠቀም እባክዎ ይግቡ።",
    noCourses: "ኤአይ አስተማሪን ለመጠቀም በኮርስ መመዝገብ አለብዎት።",
    loadError: "ኮርሶችዎን መጫን አልተቻለም።",
    tutorError: "ኤአይ አስተማሪው አሁን መልስ መስጠት አልቻለም።",
  },
  om: {
    title: "AI Tutor OSTA",
    subtitle: "Waa'ee koorsii galmaa'amtanii gaafadhaa; deebiin afaan OSTA filattanitti ni dhufa.",
    course: "Koorsii",
    lesson: "Barnoota",
    allLessons: "Koorsii guutuu",
    selectCourse: "Koorsii filadhu",
    question: "Tutor kee gaafadhu...",
    send: "Ergi",
    thinking: "Yaadaa jira...",
    empty: "AI Tutor koorsii fi barnoota filattan akka haala gaaffii keessaniitti ni fayyadama.",
    signIn: "AI Tutor fayyadamuuf maaloo seenaa.",
    noCourses: "AI Tutor fayyadamuuf koorsii tokko irratti galmaa'uu qabdu.",
    loadError: "Koorsota keessan fe'uu hin dandeenye.",
    tutorError: "AI Tutor yeroo ammaa deebii kennuu hin dandeenye.",
  },
};

export default function AITutor() {
  const { token, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const text = copy[language] || copy.en;

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const selectedCourse = useMemo(
    () => courses.find((course) => Number(course.course_id) === Number(selectedCourseId)),
    [courses, selectedCourseId]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      if (!isAuthenticated || !token) return;

      try {
        setLoadingCourses(true);
        setError("");
        const data = await apiRequest("/enrollments/my", { token });
        if (cancelled) return;

        const nextCourses = Array.isArray(data) ? data : [];
        setCourses(nextCourses);
        if (nextCourses.length) {
          setSelectedCourseId(String(nextCourses[0].course_id));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || text.loadError);
      } finally {
        if (!cancelled) setLoadingCourses(false);
      }
    }

    loadCourses();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token]);

  useEffect(() => {
    let cancelled = false;

    async function loadLessons() {
      if (!selectedCourseId) {
        setLessons([]);
        setSelectedLessonId("");
        return;
      }

      try {
        setLoadingLessons(true);
        const sections = await apiRequest(
          `/course-sections/course/${Number(selectedCourseId)}`,
          { token: null }
        );

        const collected = [];
        for (const section of Array.isArray(sections) ? sections : []) {
          const sectionLessons = await apiRequest(
            `/lessons/section/${section.id}`,
            { token: null }
          );
          for (const lesson of Array.isArray(sectionLessons) ? sectionLessons : []) {
            if (
              lesson.is_published === 1 ||
              lesson.is_published === true ||
              lesson.is_published === "1"
            ) {
              collected.push(lesson);
            }
          }
        }

        if (cancelled) return;
        setLessons(collected);
        setSelectedLessonId("");
      } catch (loadError) {
        if (!cancelled) {
          setLessons([]);
          setSelectedLessonId("");
          setError(loadError.message || text.loadError);
        }
      } finally {
        if (!cancelled) setLoadingLessons(false);
      }
    }

    loadLessons();
    return () => {
      cancelled = true;
    };
  }, [selectedCourseId]);

  useEffect(() => {
    setMessages([]);
    setError("");
  }, [selectedCourseId, selectedLessonId, language]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmed = question.trim();
    if (!trimmed || !selectedCourseId || sending) return;

    const userMessage = { role: "user", content: trimmed };
    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setSending(true);
    setError("");

    try {
      const response = await apiRequest("/ai-tutor/chat", {
        token,
        method: "POST",
        body: {
          courseId: Number(selectedCourseId),
          lessonId: selectedLessonId ? Number(selectedLessonId) : null,
          language,
          message: trimmed,
        },
      });

      setMessages((current) => [
        ...current,
        { role: "assistant", content: response.answer },
      ]);
    } catch (sendError) {
      setError(sendError.message || text.tutorError);
    } finally {
      setSending(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Bot className="mx-auto mb-3 text-primary" size={40} />
        <p className="font-semibold text-ink">{text.signIn}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary-light p-3 text-primary">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink">{text.title}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              {text.subtitle}
            </p>
          </div>
        </div>
      </section>

      {loadingCourses ? (
        <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          <Loader2 className="mr-2 inline animate-spin" size={16} />
          {text.thinking}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <BookOpen className="mx-auto mb-3 text-slate-400" size={36} />
          <p className="text-sm font-semibold text-slate-600">{text.noCourses}</p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                {text.course}
              </span>
              <select
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="">{text.selectCourse}</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                {text.lesson}
              </span>
              <select
                value={selectedLessonId}
                onChange={(event) => setSelectedLessonId(event.target.value)}
                disabled={!selectedCourseId || loadingLessons}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-slate-50"
              >
                <option value="">{text.allLessons}</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.length === 0 && (
                <div className="flex min-h-[360px] items-center justify-center text-center">
                  <div className="max-w-md">
                    <Bot className="mx-auto mb-4 text-primary" size={46} />
                    <p className="text-sm leading-6 text-slate-500">{text.empty}</p>
                    {selectedCourse && (
                      <p className="mt-3 text-xs font-semibold text-slate-400">
                        {selectedCourse.course_title}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={message.role === "user" ? "ml-auto max-w-3xl" : "max-w-3xl"}
                >
                  <div
                    className={
                      message.role === "user"
                        ? "rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-white"
                        : "rounded-2xl rounded-bl-md border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-ink"
                    }
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="max-w-3xl rounded-2xl rounded-bl-md border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  <Loader2 className="mr-2 inline animate-spin" size={15} />
                  {text.thinking}
                </div>
              )}
            </div>

            {error && (
              <p className="px-5 pb-3 text-xs font-semibold text-red-600">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="border-t border-slate-100 p-4">
              <div className="flex gap-2">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder={text.question}
                  maxLength={4000}
                  className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  disabled={sending || !selectedCourseId}
                />
                <button
                  type="submit"
                  disabled={sending || !question.trim() || !selectedCourseId}
                  className="flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
                  <span className="hidden sm:inline">{text.send}</span>
                </button>
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
