import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, X, BookOpen, Layers3, Save } from "lucide-react";
import { useLocation } from "react-router-dom";
import api from "../../services/api";

function getCourseId(pathname) {
  const match = pathname.match(/^\/instructor\/courses\/(\d+)/);
  return match?.[1] || "";
}

const emptyLesson = {
  id: null,
  sectionId: "",
  title: "",
  description: "",
  videoUrl: "",
  durationMinutes: 0,
  lessonOrder: 0,
  isPublished: true,
};

const emptySection = {
  id: null,
  title: "",
  sectionOrder: 1,
};

export default function CourseContentEditor() {
  const location = useLocation();
  const courseId = getCourseId(location.pathname);

  const [sections, setSections] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editorMode, setEditorMode] = useState(null);
  const [sectionForm, setSectionForm] = useState(emptySection);
  const [lessonForm, setLessonForm] = useState(emptyLesson);

  const isWorkspace = Boolean(courseId);

  const loadSections = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const response = await api.get(`/course-sections/course/${courseId}`);
      const data = response?.data;
      setSections(Array.isArray(data) ? data : data?.sections || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to load course content.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (isWorkspace) loadSections();
  }, [isWorkspace, loadSections]);

  if (!isWorkspace) return null;

  const startEditSection = (section) => {
    setEditorMode("section");
    setLessonForm(emptyLesson);
    setSectionForm({
      id: section.id,
      title: section.title || "",
      sectionOrder: section.section_order ?? section.sectionOrder ?? 1,
    });
    setError("");
    setSuccess("");
    setOpen(true);
  };

  const startEditLesson = (lesson, sectionId) => {
    setEditorMode("lesson");
    setSectionForm(emptySection);
    setLessonForm({
      id: lesson.id,
      sectionId: String(lesson.section_id ?? lesson.sectionId ?? sectionId),
      title: lesson.title || "",
      description: lesson.description || lesson.summary || "",
      videoUrl: lesson.video_url || lesson.videoUrl || "",
      durationMinutes: lesson.duration_minutes ?? lesson.durationMinutes ?? 0,
      lessonOrder: lesson.lesson_order ?? lesson.lessonOrder ?? 0,
      isPublished: lesson.is_published ?? lesson.isPublished ?? true,
    });
    setError("");
    setSuccess("");
    setOpen(true);
  };

  const startCreateLesson = (sectionId = "") => {
    setEditorMode("lesson");
    setSectionForm(emptySection);
    setLessonForm({
      ...emptyLesson,
      sectionId: String(sectionId || sections[0]?.id || ""),
    });
    setError("");
    setSuccess("");
    setOpen(true);
  };

  const startCreateSection = () => {
    setEditorMode("section");
    setLessonForm(emptyLesson);
    setSectionForm({
      ...emptySection,
      sectionOrder: sections.length + 1,
    });
    setError("");
    setSuccess("");
    setOpen(true);
  };

  const saveSection = async (event) => {
    event.preventDefault();
    if (!sectionForm.title.trim()) {
      setError("Section title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const payload = {
        courseId: Number(courseId),
        title: sectionForm.title.trim(),
        sectionOrder: Number(sectionForm.sectionOrder) || 1,
      };

      if (sectionForm.id) {
        await api.put(`/course-sections/${sectionForm.id}`, payload);
        setSuccess("Section updated successfully.");
      } else {
        await api.post("/course-sections", payload);
        setSuccess("Section created successfully.");
      }

      await loadSections();
      setSectionForm(emptySection);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save section.");
    } finally {
      setSaving(false);
    }
  };

  const saveLesson = async (event) => {
    event.preventDefault();
    if (!lessonForm.title.trim()) {
      setError("Lesson title is required.");
      return;
    }
    if (!lessonForm.sectionId) {
      setError("Select a section first.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const payload = {
        courseId: Number(courseId),
        sectionId: Number(lessonForm.sectionId),
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim(),
        videoUrl: lessonForm.videoUrl.trim(),
        durationMinutes: Number(lessonForm.durationMinutes) || 0,
        lessonOrder: Number(lessonForm.lessonOrder) || 0,
        isPublished: Boolean(lessonForm.isPublished),
      };

      if (lessonForm.id) {
        await api.put(`/lessons/${lessonForm.id}`, payload);
        setSuccess("Lesson updated successfully.");
      } else {
        await api.post("/lessons", payload);
        setSuccess("Lesson created successfully.");
      }

      await loadSections();
      setLessonForm(emptyLesson);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save lesson.");
    } finally {
      setSaving(false);
    }
  };

  const close = () => {
    if (saving) return;
    setOpen(false);
    setEditorMode(null);
    setError("");
    setSuccess("");
    setSectionForm(emptySection);
    setLessonForm(emptyLesson);
  };

  const cancelSectionEdit = () => {
    setEditorMode(null);
    setSectionForm(emptySection);
    setError("");
  };

  const cancelLessonEdit = () => {
    setEditorMode(null);
    setLessonForm(emptyLesson);
    setError("");
  };

  return (
    <>
      <div className="mb-4 rounded-2xl border border-border bg-surface-card px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers3 size={18} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-ink">Course content</p>
              <p className="text-xs text-ink/60">Edit sections and lessons without leaving the course workspace.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={startCreateSection} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold text-ink hover:bg-surface-muted">
              <Plus size={15} /> Add Section
            </button>
            <button type="button" onClick={() => startCreateLesson()} disabled={!sections.length} className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">
              <Plus size={15} /> Add Lesson
            </button>
            <button type="button" onClick={() => { setOpen(true); setError(""); setSuccess(""); }} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold text-ink hover:bg-surface-muted">
              <Pencil size={15} /> Edit Content
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="mb-5 rounded-2xl border border-border bg-surface-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-ink">Manage sections & lessons</h3>
              <p className="text-xs text-ink/60">Choose Edit on any item or create new content.</p>
            </div>
            <button type="button" onClick={close} className="rounded-lg p-2 text-ink/60 hover:bg-surface-muted" aria-label="Close editor">
              <X size={18} />
            </button>
          </div>

          {loading ? (
            <p className="py-6 text-center text-sm text-ink/60">Loading content...</p>
          ) : (
            <div className="space-y-3">
              {sections.map((section) => (
                <div key={section.id} className="rounded-xl border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-primary" />
                      <span className="text-sm font-bold text-ink">{section.title}</span>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEditSection(section)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold text-ink hover:bg-surface-muted"><Pencil size={13} /> Edit</button>
                      <button type="button" onClick={() => startCreateLesson(section.id)} className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-bold text-white hover:bg-primary-hover"><Plus size={13} /> Lesson</button>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1.5 pl-6">
                    {(section.lessons || []).map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface-muted px-3 py-2">
                        <span className="truncate text-xs font-semibold text-ink">{lesson.title}</span>
                        <button type="button" onClick={() => startEditLesson(lesson, section.id)} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface-card px-2 py-1 text-[11px] font-bold text-ink hover:bg-surface-muted"><Pencil size={12} /> Edit</button>
                      </div>
                    ))}
                    {!section.lessons?.length && <p className="text-xs text-ink/50">No lessons yet.</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {editorMode === "section" && (
            <form onSubmit={saveSection} className="mt-5 rounded-xl border border-border bg-surface-muted p-4">
              <div className="mb-3 flex items-center gap-2"><Layers3 size={16} className="text-primary" /><h4 className="text-sm font-extrabold text-ink">{sectionForm.id ? "Edit Section" : "Create Section"}</h4></div>
              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <input value={sectionForm.title} onChange={(e) => setSectionForm((v) => ({ ...v, title: e.target.value }))} placeholder="Section title" className="rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-ink outline-none focus:border-primary" />
                <input type="number" min="1" value={sectionForm.sectionOrder} onChange={(e) => setSectionForm((v) => ({ ...v, sectionOrder: e.target.value }))} placeholder="Order" className="rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-ink outline-none focus:border-primary" />
              </div>
              <div className="mt-3 flex gap-2"><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><Save size={14} /> Save Section</button><button type="button" onClick={cancelSectionEdit} className="rounded-xl border border-border px-3 py-2 text-xs font-bold text-ink">Cancel</button></div>
            </form>
          )}

          {editorMode === "lesson" && (
            <form onSubmit={saveLesson} className="mt-5 rounded-xl border border-border bg-surface-muted p-4">
              <div className="mb-3 flex items-center gap-2"><BookOpen size={16} className="text-primary" /><h4 className="text-sm font-extrabold text-ink">{lessonForm.id ? "Edit Lesson" : "Create Lesson"}</h4></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={lessonForm.title} onChange={(e) => setLessonForm((v) => ({ ...v, title: e.target.value }))} placeholder="Lesson title" className="rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-ink outline-none focus:border-primary" />
                <select value={lessonForm.sectionId} onChange={(e) => setLessonForm((v) => ({ ...v, sectionId: e.target.value }))} className="rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-ink outline-none focus:border-primary">
                  <option value="">Select section</option>
                  {sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}
                </select>
                <textarea value={lessonForm.description} onChange={(e) => setLessonForm((v) => ({ ...v, description: e.target.value }))} placeholder="Lesson description" rows={3} className="rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-ink outline-none focus:border-primary sm:col-span-2" />
                <input value={lessonForm.videoUrl} onChange={(e) => setLessonForm((v) => ({ ...v, videoUrl: e.target.value }))} placeholder="Video URL (optional)" className="rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-ink outline-none focus:border-primary" />
                <input type="number" min="0" value={lessonForm.durationMinutes} onChange={(e) => setLessonForm((v) => ({ ...v, durationMinutes: e.target.value }))} placeholder="Duration (minutes)" className="rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-ink outline-none focus:border-primary" />
              </div>
              <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-ink"><input type="checkbox" checked={lessonForm.isPublished} onChange={(e) => setLessonForm((v) => ({ ...v, isPublished: e.target.checked }))} /> Published</label>
              <div className="mt-3 flex gap-2"><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><Save size={14} /> Save Lesson</button><button type="button" onClick={cancelLessonEdit} className="rounded-xl border border-border px-3 py-2 text-xs font-bold text-ink">Cancel</button></div>
            </form>
          )}

          {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
          {success && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{success}</p>}
        </div>
      )}
    </>
  );
}
