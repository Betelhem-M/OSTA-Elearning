import { useState } from 'react'
import { ChevronDown, CheckCircle2, PlayCircle, Circle } from 'lucide-react'

export default function ChapterAccordion({ chapters, activeLessonId, onSelectLesson }) {
  const [openChapters, setOpenChapters] = useState(new Set([chapters[0]?.id]))

  function toggleChapter(id) {
    setOpenChapters((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
      {chapters.map((chapter) => {
        const isOpen = openChapters.has(chapter.id)
        return (
          <div key={chapter.id} className="border-b border-slate-100 last:border-0">
            <button
              onClick={() => toggleChapter(chapter.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50"
            >
              <ChevronDown size={17} className={`shrink-0 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              <span className="min-w-0 flex-1">
                <strong className="block text-sm text-ink">{chapter.title}</strong>
                <span className="mt-0.5 block text-[11px] text-slate-400">
                  {chapter.lessons ? `${chapter.lessons.length} lessons` : 'Not published yet'}
                </span>
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-slate-100 bg-slate-50/60 px-2 py-1">
                {chapter.lessons ? (
                  chapter.lessons.map((lesson) => {
                    const isActive = lesson.id === activeLessonId
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => (lesson.status === 'locked' ? null : onSelectLesson(lesson))}
                        disabled={lesson.status === 'locked'}
                        className={`my-1 flex min-h-[52px] w-full items-center gap-3 rounded-lg border-l-[3px] px-2.5 py-2 text-left transition ${
                          isActive ? 'border-primary bg-primary-light' : 'border-transparent hover:bg-white'
                        } ${lesson.status === 'locked' ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {lesson.status === 'done' ? (
                          <CheckCircle2 size={16} className="shrink-0 text-primary" />
                        ) : isActive ? (
                          <PlayCircle size={16} className="shrink-0 text-primary" />
                        ) : (
                          <Circle size={16} className="shrink-0 text-slate-300" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-ink">{lesson.title}</span>
                          <span className="text-[11px] text-slate-400">
                            {lesson.duration}
                            {isActive && <span className="ml-1 font-semibold text-primary">· Now Playing</span>}
                          </span>
                        </span>
                      </button>
                    )
                  })
                ) : (
                  <p className="px-3 py-3 text-xs text-slate-400">
                    No lessons have been published for this chapter yet.
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}