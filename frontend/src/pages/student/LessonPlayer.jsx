import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, Share2, ChevronRight, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import VideoPlayer from "@components/learning/VideoPlayer";
import ChapterAccordion from "@components/learning/ChapterAccordion";
import NotesPanel from "@components/learning/NotesPanel";
import QuizPanel from "@components/learning/QuizPanel";
import DiscussionPanel from "@components/learning/DiscussionPanel";
import AITutor from "./AITutor";
import { copyToClipboard } from "@utils/sharing";
import { apiRequest } from "@services/api";
import { useLanguage } from "@context/LanguageContext";

const TABS = ["Overview", "Notes", "Transcript", "Discussion", "Resources", "Quiz"];
const labels = {
  en: { back: "Back to Course", curriculum: "Course Curriculum", watched: "% watched", completed: "Completed", mark: "Mark Complete", info: "Lesson Information", duration: "Duration", progress: "Progress", status: "Status", inProgress: "In Progress", about: "About this lesson", noDescription: "No description available.", transcript: "Transcript", noTranscript: "No transcript has been added to this lesson yet.", resources: "Lesson Resources", openResource: "Open Resource", noResources: "No resources have been added yet.", previous: "Previous", next: "Next Lesson", copied: "Link copied.", saving: "Saving progress..." },
  am: { back: "ወደ ኮርስ ተመለስ", curriculum: "የኮርስ ይዘት", watched: "% ታይቷል", completed: "ተጠናቋል", mark: "እንደተጠናቀቀ ምልክት አድርግ", info: "የትምህርት መረጃ", duration: "ቆይታ", progress: "እድገት", status: "ሁኔታ", inProgress: "በሂደት ላይ", about: "ስለዚህ ትምህርት", noDescription: "ምንም መግለጫ የለም።", transcript: "ትራንስክሪፕት", noTranscript: "ለዚህ ትምህርት ትራንስክሪፕት አልተጨመረም።", resources: "የትምህርት ምንጮች", openResource: "ምንጩን ክፈት", noResources: "ምንጮች አልተጨመሩም።", previous: "ቀዳሚ", next: "ቀጣዩ ትምህርት", copied: "አገናኙ ተቀድቷል።", saving: "እድገት በማስቀመጥ ላይ..." },
  om: { back: "Gara Koorsii Deebi'i", curriculum: "Qabiyyee Koorsii", watched: "% ilaalame", completed: "Xumurame", mark: "Xumurame jechuun mallatteessi", info: "Odeeffannoo Barnootaa", duration: "Turtii", progress: "Guddina", status: "Haala", inProgress: "Adeemsa irra", about: "Waa'ee barnoota kanaa", noDescription: "Ibsi hin jiru.", transcript: "Barruu", noTranscript: "Barruun barnoota kanaa hin dabalamin.", resources: "Qabeenya Barnootaa", openResource: "Qabeenya Bani", noResources: "Qabeenyi hin dabalamin.", previous: "Duraa", next: "Barnoota Itti Aanu", copied: "Geessituun waraabame.", saving: "Guddina olkaa'aa jira..." },
};

export default function LessonPlayer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = labels[language] || labels.en;
  const [lesson, setLesson] = useState(null);
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle");
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [videoState, setVideoState] = useState({ currentSeconds: 0, durationSeconds: 0, isPlaying: false });
  const lastSavedTimeRef = useRef(0);

  async function loadLesson() {
    try {
      setLoading(true); setError("");
      const token = localStorage.getItem("osta_token");
      if (!token) throw new Error("You are not logged in.");
      const lessonData = await apiRequest(`/lessons/${lessonId}`, { token });
      setLesson(lessonData);
      let currentProgress = null;
      try { currentProgress = await apiRequest(`/progress/lesson/${lessonId}`, { token }); } catch (e) { if (e?.message !== "Lesson progress not found") console.warn(e); }
      setProgress(currentProgress); setCompleted(Boolean(currentProgress?.completed));
      const allProgress = await apiRequest("/progress/my", { token });
      setCompletedLessonIds(new Set((Array.isArray(allProgress) ? allProgress : []).filter(x => Boolean(x.completed)).map(x => Number(x.lesson_id))));
      const rawSections = await apiRequest(`/course-sections/course/${lessonData.course_id}`, { token });
      const sectionsWithLessons = await Promise.all((Array.isArray(rawSections) ? rawSections : []).map(async section => {
        try { const lessons = await apiRequest(`/lessons/section/${section.id}`, { token }); return { ...section, lessons: Array.isArray(lessons) ? lessons : [] }; }
        catch { return { ...section, lessons: [] }; }
      }));
      setSections(sectionsWithLessons);
    } catch (err) { console.error("Lesson player error:", err); setError(err.message || "Failed to load lesson."); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadLesson(); }, [lessonId]);

  const allLessons = useMemo(() => sections.flatMap(section => (section.lessons || []).map(item => ({ ...item, sectionTitle: section.title }))), [sections]);
  const currentIndex = allLessons.findIndex(item => Number(item.id) === Number(lessonId));
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  async function saveProgress(seconds, force = false) {
    if (!lesson) return;
    const token = localStorage.getItem("osta_token"); if (!token) return;
    const rounded = Math.floor(Number(seconds) || 0);
    if (!force && Math.abs(rounded - lastSavedTimeRef.current) < 5) return;
    try {
      setIsSavingProgress(true);
      const duration = Number(videoState.durationSeconds) || Number(lesson.duration_minutes) * 60 || 0;
      const percentage = duration > 0 ? Math.min(100, Math.round((rounded / duration) * 100)) : 0;
      const response = await apiRequest(`/progress/lesson/${lesson.id}`, { token, method: "PUT", body: { progressPercent: percentage, lastPositionSeconds: rounded, completed: percentage >= 100 || completed } });
      if (response?.progress) setProgress(response.progress);
      lastSavedTimeRef.current = rounded;
      if (percentage >= 100 || completed) setCompletedLessonIds(prev => new Set([...prev, Number(lesson.id)]));
    } catch (err) { console.error("Save progress error:", err); }
    finally { setIsSavingProgress(false); }
  }
  useEffect(() => { if (!lesson || !videoState.isPlaying) return; const timer = setTimeout(() => saveProgress(videoState.currentSeconds), 5000); return () => clearTimeout(timer); }, [lesson, videoState.currentSeconds, videoState.isPlaying]);

  async function handleCompleteLesson() {
    try { const token = localStorage.getItem("osta_token"); if (!token) throw new Error("You are not logged in."); await apiRequest(`/progress/lesson/${lesson.id}/complete`, { token, method: "PUT" }); setCompleted(true); setCompletedLessonIds(prev => new Set([...prev, Number(lesson.id)])); }
    catch (err) { setError(err.message || "Failed to complete lesson."); }
  }
  async function handleShare() { const success = await copyToClipboard(window.location.href); setCopyStatus(success ? "copied" : "error"); setTimeout(() => setCopyStatus("idle"), 1800); }
  function goBack() { navigate(lesson?.course_id ? `/courses/${lesson.course_id}` : "/my-learning"); }

  if (loading) return <div className="mx-auto max-w-[1200px] px-4 py-10"><div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">Loading lesson...</div></div>;
  if (error || !lesson) return <div className="mx-auto max-w-[600px] px-5 py-16 text-center"><AlertCircle size={35} className="mx-auto text-red-500"/><h1 className="mt-4 text-xl font-bold text-ink">Lesson could not be loaded</h1><p className="mt-2 text-sm text-slate-500">{error}</p><button onClick={loadLesson} className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Try Again</button></div>;

  const progressPercent = videoState.durationSeconds > 0 ? Math.min(100, (videoState.currentSeconds / videoState.durationSeconds) * 100) : Number(progress?.progress_percent) || 0;
  return <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
    <button onClick={goBack} className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"><ArrowLeft size={14}/>{t.back}</button>
    <div className="mb-6"><h2 className="mb-3 text-lg font-bold text-ink">{t.curriculum}</h2><ChapterAccordion chapters={sections} activeLessonId={Number(lessonId)} completedLessonIds={completedLessonIds}/></div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.8fr)]">
      <div className="space-y-4">
        <VideoPlayer videoUrl={lesson.video_url} title={lesson.title} durationMinutes={lesson.duration_minutes} initialPosition={Number(progress?.last_position_seconds) || 0} onStateChange={setVideoState} onComplete={handleCompleteLesson}/>
        <section className="rounded-xl border border-slate-100 bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-lg font-bold text-ink">{lesson.title}</h1><p className="mt-1 text-xs text-slate-400">{Math.round(progressPercent)}{t.watched}</p></div><div className="flex gap-2"><button onClick={() => setIsBookmarked(v => !v)} className="rounded-lg border border-slate-200 p-2 text-slate-600"><Bookmark size={15}/></button><button onClick={handleShare} className="rounded-lg border border-slate-200 p-2 text-slate-600"><Share2 size={15}/></button></div></div>{copyStatus === "copied" && <p className="mt-2 text-right text-xs text-green-600">{t.copied}</p>}{isSavingProgress && <p className="mt-2 text-right text-xs text-slate-400">{t.saving}</p>}<div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-xs text-slate-400">{lesson.section_title}</span><button onClick={handleCompleteLesson} disabled={completed} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${completed ? "bg-primary-light text-primary" : "bg-primary text-white hover:bg-primary-hover"}`}><CheckCircle2 size={14}/>{completed ? t.completed : t.mark}</button></div></section>
        <section className="rounded-xl border border-slate-100 bg-white"><nav className="flex gap-5 overflow-x-auto border-b border-slate-200 px-5">{TABS.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`border-b-2 py-3 text-xs font-semibold ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-slate-500"}`}>{tab}</button>)}</nav>{activeTab === "Overview" && <div className="p-5"><h2 className="text-sm font-bold text-ink">{t.about}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{lesson.description || t.noDescription}</p></div>}{activeTab === "Notes" && <NotesPanel lessonId={lesson.id} currentSeconds={videoState.currentSeconds}/>} {activeTab === "Transcript" && <div className="p-5"><h2 className="text-sm font-bold text-ink">{t.transcript}</h2>{lesson.transcript ? <div className="mt-4 whitespace-pre-line rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">{lesson.transcript}</div> : <p className="mt-4 text-sm text-slate-400">{t.noTranscript}</p>}</div>}{activeTab === "Discussion" && <DiscussionPanel lesson={lesson}/>} {activeTab === "Resources" && <div className="p-5"><h2 className="text-sm font-bold text-ink">{t.resources}</h2>{lesson.resource_url ? <a href={lesson.resource_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white">{t.openResource}</a> : <p className="mt-4 text-sm text-slate-400">{t.noResources}</p>}</div>}{activeTab === "Quiz" && <QuizPanel courseId={lesson.course_id} lessonId={lesson.id}/>}</section>
        <div className="flex gap-3">{previousLesson && <Link to={`/learn/${previousLesson.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-600"><ChevronRight size={15} className="rotate-180"/>{t.previous}</Link>}{nextLesson ? <Link to={`/learn/${nextLesson.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-white">{t.next}<ChevronRight size={15}/></Link> : <Link to={`/courses/${lesson.course_id}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-white">{t.back}<ChevronRight size={15}/></Link>}</div>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start"><AITutor embeddedCourseId={Number(lesson.course_id)} embeddedLessonId={Number(lesson.id)}/><div className="rounded-xl border border-slate-100 bg-white p-5"><h3 className="text-sm font-bold text-ink">{t.info}</h3><div className="mt-4 space-y-3"><div className="flex justify-between text-xs"><span className="text-slate-400">{t.duration}</span><span className="font-semibold text-slate-600">{lesson.duration_minutes} min</span></div><div className="flex justify-between text-xs"><span className="text-slate-400">{t.progress}</span><span className="font-semibold text-primary">{Math.round(progressPercent)}%</span></div><div className="flex justify-between text-xs"><span className="text-slate-400">{t.status}</span><span className="font-semibold text-slate-600">{completed ? t.completed : t.inProgress}</span></div></div></div></aside>
    </div>
  </div>;
}
