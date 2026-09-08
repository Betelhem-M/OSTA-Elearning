import { useEffect, useState } from "react";
import { Bot, BookOpen, Loader2, Send, Sparkles } from "lucide-react";

import { apiRequest } from "@services/api";
import { useAuth } from "@context/AuthContext";
import { useLanguage } from "@context/LanguageContext";

const copy = {
  en: {
    title: "OSTA AI Tutor",
    subtitle: "Ask questions about your course or the current lesson.",
    course: "Course",
    lesson: "Lesson",
    allLessons: "Course-wide",
    selectCourse: "Select a course",
    question: "Ask your tutor...",
    send: "Send",
    thinking: "Thinking...",
    noCourses: "You need to be enrolled in a course before using the AI Tutor.",
    loadError: "Unable to load your enrolled courses.",
    tutorError: "The AI Tutor could not answer right now. Please try again.",
    signIn: "Please sign in to use the AI Tutor.",
  },
  am: {
    title: "የኦስታ ኤአይ አስተማሪ",
    subtitle: "ስለ ኮርስዎ ወይም ስለ አሁኑ ትምህርት ይጠይቁ።",
    course: "ኮርስ",
    lesson: "ትምህርት",
    allLessons: "ሙሉ ኮርስ",
    selectCourse: "ኮርስ ይምረጡ",
    question: "አስተማሪዎን ይጠይቁ...",
    send: "ላክ",
    thinking: "በማሰብ ላይ...",
    noCourses: "ኤአይ አስተማሪን ለመጠቀም በኮርስ መመዝገብ አለብዎት።",
    loadError: "የተመዘገቡባቸውን ኮርሶች መጫን አልተቻለም።",
    tutorError: "ኤአይ አስተማሪው አሁን መልስ መስጠት አልቻለም።",
    signIn: "ኤአይ አስተማሪን ለመጠቀም ይግቡ።",
  },
  om: {
    title: "AI Tutor OSTA",
    subtitle: "Waa'ee koorsii ykn barnoota amma jirtuu gaafadhu.",
    course: "Koorsii",
    lesson: "Barnoota",
    allLessons: "Koorsii guutuu",
    selectCourse: "Koorsii filadhu",
    question: "Tutor kee gaafadhu...",
    send: "Ergi",
    thinking: "Yaadaa jira...",
    noCourses: "AI Tutor fayyadamuuf koorsii irratti galmaa'uu qabda.",
    loadError: "Koorsota galmaa'amtan fe'uu hin dandeenye.",
    tutorError: "AI Tutor yeroo ammaa deebii kennuu hin dandeenye.",
    signIn: "AI Tutor fayyadamuuf seeni.",
  },
};

export default function AITutor({ embeddedCourseId = null, embeddedLessonId = null }) {
  const { token, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const text = copy[language] || copy.en;
  const embedded = Number(embeddedCourseId) > 0;

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(embedded ? String(embeddedCourseId) : "");
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState(embedded ? String(embeddedLessonId || "") : "");
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !token || embedded) return;

    let cancelled = false;

    async function loadCourses() {
      try {
        setLoadingCourses(true);
        setError("");
        const response = await apiRequest("/enrollments/my", { token });
        if (cancelled) return;

        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.enrollments)
              ? response.enrollments
              : [];

        setCourses(data);
        if (data.length) {
          setSelectedCourseId(String(data[0].course_id || data[0].courseId || data[0].id));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || text.loadError);
      } finally {
        if (!cancelled) setLoadingCourses(false);
      }
    }

    loadCourses();
    return () => { cancelled = true; };
  }, [embedded, isAuthenticated, token]);

  useEffect(() => {
    if (!selectedCourseId) {
      setLessons([]);
      if (!embedded) setSelectedLessonId("");
      return;
    }

    let cancelled = false;

    async function loadLessons() {
      try {
        setLoadingLessons(true);
        const sectionsResponse = await apiRequest(`/course-sections/course/${Number(selectedCourseId)}`, { token: null });
        const sections = Array.isArray(sectionsResponse)
          ? sectionsResponse
          : Array.isArray(sectionsResponse?.data)
            ? sectionsResponse.data
            : [];

        const collected = [];
        for (const section of sections) {
          const lessonsResponse = await apiRequest(`/lessons/section/${section.id}`, { token: null });
          const sectionLessons = Array.isArray(lessonsResponse)
            ? lessonsResponse
            : Array.isArray(lessonsResponse?.data)
              ? lessonsResponse.data
              : [];

          collected.push(...sectionLessons.filter((lesson) =>
            lesson.is_published === 1 || lesson.is_published === true || lesson.is_published === "1"
          ));
        }

        if (cancelled) return;
        setLessons(collected);
        if (!embedded) setSelectedLessonId("");
      } catch (loadError) {
        if (!cancelled) {
          setLessons([]);
          setError(loadError.message || text.loadError);
        }
      } finally {
        if (!cancelled) setLoadingLessons(false);
      }
    }

    loadLessons();
    return () => { cancelled = true; };
  }, [embedded, selectedCourseId]);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = question.trim();
    const courseId = Number(selectedCourseId);
    const lessonId = Number(selectedLessonId);
    if (!trimmed || !courseId || sending) return;

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setQuestion("");
    setSending(true);
    setError("");

    try {
      const response = await apiRequest("/ai-tutor/chat", {
        token,
        method: "POST",
        body: {
          courseId,
          lessonId: lessonId > 0 ? lessonId : null,
          language,
          message: trimmed,
        },
      });

      setMessages((current) => [...current, { role: "assistant", content: response.answer }]);
    } catch (requestError) {
      setError(requestError.message || text.tutorError);
    } finally {
      setSending(false);
    }
  }

  if (!isAuthenticated) {
    return <div className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm font-semibold text-slate-600">{text.signIn}</div>;
  }

  if (!embedded && loadingCourses) {
    return <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm"><Loader2 className="mr-2 inline animate-spin" size={16} />{text.thinking}</div>;
  }

  if (!embedded && courses.length === 0) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><BookOpen className="mx-auto mb-3 text-slate-400" size={36} /><p className="text-sm font-semibold text-slate-600">{text.noCourses}</p></div>;
  }

  const wrapper = embedded
    ? "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    : "space-y-5";

  return (
    <div className={wrapper}>
      <section className={embedded ? "border-b border-slate-100 bg-slate-50 p-4" : "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"}>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary-light p-2.5 text-primary"><Sparkles size={19} /></div>
          <div>
            <h2 className={embedded ? "text-sm font-extrabold text-ink" : "text-2xl font-extrabold text-ink"}>{embedded ? "AI Tutor" : text.title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">{text.subtitle}</p>
          </div>
        </div>
      </section>

      {!embedded && (
        <section className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">{text.course}</span>
            <select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-ink">
              <option value="">{text.selectCourse}</option>
              {courses.map((course) => {
                const id = course.course_id || course.courseId || course.id;
                return <option key={id} value={id}>{course.course_title || course.courseTitle || course.title}</option>;
              })}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">{text.lesson}</span>
            <select value={selectedLessonId} onChange={(event) => setSelectedLessonId(event.target.value)} disabled={loadingLessons} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-ink">
              <option value="">{text.allLessons}</option>
              {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
            </select>
          </label>
        </section>
      )}

      <section className={embedded ? "flex min-h-[360px] flex-col" : "flex min-h-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100"}>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex min-h-[180px] items-center justify-center text-center">
              <div><Bot className="mx-auto text-primary" size={34} /><p className="mt-3 text-xs leading-5 text-slate-500">{text.subtitle}</p></div>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto max-w-[90%]" : "max-w-[95%]"}>
              <div className={message.role === "user" ? "rounded-xl rounded-br-sm bg-primary px-3 py-2 text-xs leading-5 text-white" : "rounded-xl rounded-bl-sm bg-slate-50 px-3 py-2 text-xs leading-5 text-ink"}>{message.content}</div>
            </div>
          ))}
          {sending && <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500"><Loader2 className="mr-1 inline animate-spin" size={14} />{text.thinking}</div>}
        </div>

        {error && <p className="px-4 pb-2 text-xs font-semibold text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="border-t border-slate-100 p-3">
          <div className="flex gap-2">
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={text.question} maxLength={4000} disabled={sending || !selectedCourseId} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-ink outline-none focus:border-primary" />
            <button type="submit" disabled={sending || !question.trim() || !selectedCourseId} className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2.5 text-white hover:bg-primary-hover disabled:opacity-50" aria-label={text.send}>{sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
