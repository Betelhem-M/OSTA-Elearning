import { useState } from 'react'
import { ChevronDown, CheckCircle2, Circle } from 'lucide-react'

export default function CourseCurriculum({ sections }) {
  const [openSections, setOpenSections] = useState(new Set(sections[0] ? [sections[0].id] : []))

  function toggleSection(id) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function expandAll() {
    setOpenSections(new Set(sections.map((s) => s.id)))
  }

  const allOpen = openSections.size === sections.length

  return (
    <section aria-labelledby="curriculum-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="curriculum-title" className="text-lg font-bold text-ink">
          Course Curriculum
        </h2>
        <button
          onClick={allOpen ? () => setOpenSections(new Set()) : expandAll}
          className="text-xs font-bold text-primary hover:underline"
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id)
          return (
            <div key={section.id} className="mb-2 overflow-hidden rounded-xl border border-slate-100 last:mb-0">
              <button
                onClick={() => toggleSection(section.id)}
                aria-expanded={isOpen}
                className={`flex w-full items-center gap-3 px-4 py-4 text-left transition-colors ${
                  isOpen ? 'bg-primary text-white' : 'bg-white text-slate-700 hover:bg-primary-light'
                }`}
              >
                <ChevronDown size={17} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                <span className="flex-1 text-sm font-bold">{section.title}</span>
                <span className={`text-xs ${isOpen ? 'text-white/80' : 'text-slate-400'}`}>
                  {section.lessons ? `${section.lessons.length} lessons` : ''}
                </span>
              </button>

              {isOpen && (
                <div>
                  {section.lessons ? (
                    <div className="divide-y divide-slate-100 bg-white">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                          {lesson.done ? (
                            <CheckCircle2 size={16} className="shrink-0 text-primary" />
                          ) : (
                            <Circle size={16} className="shrink-0 text-slate-300" />
                          )}
                          <span className="flex-1 text-sm text-slate-700">{lesson.title}</span>
                          <span className="text-xs text-slate-400">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 px-5 py-4 text-xs text-slate-400">
                      No lessons have been published for this section yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}