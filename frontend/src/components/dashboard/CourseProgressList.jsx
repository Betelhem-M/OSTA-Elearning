import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function CourseProgressList({ courses }) {
  return (
    <section aria-labelledby="courses-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="courses-title" className="text-lg font-bold text-ink">
          My Courses
        </h2>
        <Link to="/courses" className="flex items-center text-xs font-bold text-primary hover:underline">
          View All ({courses.length}) <ChevronRight size={15} />
        </Link>
      </div>

      <div className="hide-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/courses/${course.id}`}
            className="w-[156px] shrink-0 snap-start overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_3px_12px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
          >
            <div className="h-20 w-full" style={{ backgroundColor: course.thumbnailColor }} />
            <div className="p-3">
              <h3 className="line-clamp-2 text-xs font-bold text-ink">{course.title}</h3>
              <p className="mt-1 text-[11px] text-slate-400">{course.instructor}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-primary" style={{ width: `${course.progress}%` }} />
              </div>
              <p className="mt-1 text-[10px] font-bold text-primary">{course.progress}% complete</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}