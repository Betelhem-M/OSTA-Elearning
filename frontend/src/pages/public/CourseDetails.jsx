import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCourseById, courses } from '@mocks/courses'
import CourseCurriculum from '@components/course/CourseCurriculum'
import EnrollCard from '@components/course/EnrollCard'
import InstructorBio from '@components/course/InstructorBio'

export default function CourseDetails() {
  const { courseId } = useParams()
  const course = getCourseById(courseId)
  const [showMore, setShowMore] = useState(false)

  if (!course) {
    return (
      <div className="mx-auto max-w-[600px] px-5 py-16 text-center">
        <h1 className="text-xl font-bold text-ink">Course not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          "{courseId}" doesn't match any course in this build.
        </p>
        <Link to="/courses" className="mt-4 inline-block text-sm font-bold text-primary hover:underline">
          Back to Course Marketplace
        </Link>
      </div>
    )
  }

  const [firstParagraph, ...restParagraphs] = course.longDescription

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 lg:px-10">
      <div className="h-56 w-full rounded-2xl" style={{ backgroundColor: course.thumbnailColor }} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          <div>
            <span className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-bold text-primary">
              {course.category}
            </span>
            <h1 className="mt-3 text-2xl font-extrabold text-ink">{course.title}</h1>
            <p className="mt-1 text-sm text-slate-500">by {course.instructor}</p>

            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>{firstParagraph}</p>
              {showMore && restParagraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>

            {restParagraphs.length > 0 && (
              <button
                onClick={() => setShowMore((v) => !v)}
                className="mt-3 text-sm font-bold text-primary hover:underline"
              >
                {showMore ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>

          <CourseCurriculum sections={course.curriculum} />
        </div>

        <div className="space-y-6">
          <EnrollCard course={course} />
          <InstructorBio name={course.instructor} />
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-bold text-ink">You might also like</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {courses
            .filter((c) => c.id !== course.id && c.category === course.category)
            .slice(0, 3)
            .map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="h-20 w-full rounded-lg" style={{ backgroundColor: c.thumbnailColor }} />
                <h3 className="mt-3 line-clamp-2 text-sm font-bold text-ink">{c.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{c.instructor}</p>
              </Link>
            ))}
        </div>
      </section>
    </main>
  )
}