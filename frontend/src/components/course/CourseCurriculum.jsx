import { useState } from 'react'
import { ChevronDown, CheckCircle2, Circle } from 'lucide-react'

export default function CourseCurriculum({ sections = [] }) {
  const [openSections, setOpenSections] = useState(
    new Set(sections.length > 0 ? [sections[0].id] : [])
  )

  function toggleSection(id) {
    setOpenSections((prev) => {
      const next = new Set(prev)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }

  function expandAll() {
    setOpenSections(new Set(sections.map((section) => section.id)))
  }

  const allOpen =
    sections.length > 0 &&
    openSections.size === sections.length

  return (
    <section aria-labelledby="curriculum-title">
      <div className="mb-3 flex items-center justify-between">
        <h2
          id="curriculum-title"
          className="text-lg font-bold text-ink"
        >
          Course Curriculum
        </h2>

        {sections.length > 0 && (
          <button
            type="button"
            onClick={
              allOpen
                ? () => setOpenSections(new Set())
                : expandAll
            }
            className="text-xs font-bold text-primary hover:underline"
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        )}
      </div>

      {sections.length === 0 ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-6 text-center text-sm text-slate-400">
          No course sections have been published yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100">
          {sections.map((section) => {
            const isOpen = openSections.has(section.id)
            const lessons = section.lessons || []

            return (
              <div
                key={section.id}
                className="mb-2 overflow-hidden rounded-xl border border-slate-100 last:mb-0"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center gap-3 px-4 py-4 text-left transition-colors ${
                    isOpen
                      ? 'bg-primary text-white'
                      : 'bg-white text-slate-700 hover:bg-primary-light'
                  }`}
                >
                  <ChevronDown
                    size={17}
                    className={`shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />

                  <span className="flex-1 text-sm font-bold">
                    {section.title}
                  </span>

                  <span
                    className={`text-xs ${
                      isOpen
                        ? 'text-white/80'
                        : 'text-slate-400'
                    }`}
                  >
                    {lessons.length > 0
                      ? `${lessons.length} ${
                          lessons.length === 1
                            ? 'lesson'
                            : 'lessons'
                        }`
                      : 'No lessons'}
                  </span>
                </button>

                {isOpen && (
                  <div>
                    {lessons.length > 0 ? (
                      <div className="divide-y divide-slate-100 bg-white">
                        {lessons.map((lesson) => {
                          const completed =
                            lesson.completed ||
                            lesson.done ||
                            Number(lesson.progress_percent) >= 100

                          const duration =
                            lesson.duration ||
                            (lesson.duration_minutes
                              ? `${lesson.duration_minutes} min`
                              : '')

                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 px-4 py-3"
                            >
                              {completed ? (
                                <CheckCircle2
                                  size={16}
                                  className="shrink-0 text-primary"
                                />
                              ) : (
                                <Circle
                                  size={16}
                                  className="shrink-0 text-slate-300"
                                />
                              )}

                              <span className="flex-1 text-sm text-slate-700">
                                {lesson.title}
                              </span>

                              {duration && (
                                <span className="text-xs text-slate-400">
                                  {duration}
                                </span>
                              )}
                            </div>
                          )
                        })}
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
      )}
    </section>
  )
}