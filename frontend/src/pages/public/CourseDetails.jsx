import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import CourseCurriculum from '@components/course/CourseCurriculum'
import EnrollCard from '@components/course/EnrollCard'
import InstructorBio from '@components/course/InstructorBio'

const API_URL = 'http://localhost:5000/api'

export default function CourseDetails() {
  const { courseId } = useParams()

  const [course, setCourse] = useState(null)
  const [courses, setCourses] = useState([])
  const [curriculum, setCurriculum] = useState([])
  const [loading, setLoading] = useState(true)
  const [curriculumLoading, setCurriculumLoading] = useState(true)
  const [error, setError] = useState('')
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    async function loadCourse() {
      try {
        setLoading(true)
        setError('')

        const [courseResponse, coursesResponse] = await Promise.all([
          fetch(`${API_URL}/courses/${courseId}`),
          fetch(`${API_URL}/courses`),
        ])

        const courseData = await courseResponse.json()
        const coursesData = await coursesResponse.json()

        if (!courseResponse.ok) {
          throw new Error(
            courseData.message || 'Failed to fetch course'
          )
        }

        if (!coursesResponse.ok) {
          throw new Error(
            coursesData.message || 'Failed to fetch courses'
          )
        }

        setCourse(courseData)
        setCourses(coursesData)
      } catch (err) {
        console.error('Course details error:', err)
        setError(err.message || 'Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [courseId])

  useEffect(() => {
    async function loadCurriculum() {
      try {
        setCurriculumLoading(true)

        const response = await fetch(
          `${API_URL}/course-sections/course/${courseId}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to fetch course curriculum'
          )
        }

        setCurriculum(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Curriculum error:', err)
        setCurriculum([])
      } finally {
        setCurriculumLoading(false)
      }
    }

    loadCurriculum()
  }, [courseId])

  if (loading) {
    return (
      <main className="mx-auto max-w-[1100px] px-5 py-16 lg:px-10">
        <div className="text-center text-sm font-semibold text-slate-500">
          Loading course...
        </div>
      </main>
    )
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-[600px] px-5 py-16 text-center">
        <h1 className="text-xl font-bold text-ink">
          Course not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {error || `"${courseId}" doesn't match any course.`}
        </p>

        <Link
          to="/courses"
          className="mt-4 inline-block text-sm font-bold text-primary hover:underline"
        >
          Back to Course Marketplace
        </Link>
      </div>
    )
  }

  const longDescription = course.long_description || ''

  const descriptionParagraphs = longDescription
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const firstParagraph =
    descriptionParagraphs[0] || course.description || ''

  const restParagraphs = descriptionParagraphs.slice(1)

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 lg:px-10">
      <div
        className="h-56 w-full rounded-2xl"
        style={{
          backgroundColor:
            course.thumbnail_color || '#2E7D32',
        }}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          <div>
            <span className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-bold text-primary">
              {course.category_name}
            </span>

            <h1 className="mt-3 text-2xl font-extrabold text-ink">
              {course.title}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              by {course.instructor_name}
            </p>

            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>{firstParagraph}</p>

              {showMore &&
                restParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>

            {restParagraphs.length > 0 && (
              <button
                type="button"
                onClick={() => setShowMore((value) => !value)}
                className="mt-3 text-sm font-bold text-primary hover:underline"
              >
                {showMore ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>

          {curriculumLoading ? (
            <section>
              <div className="mb-3">
                <h2 className="text-lg font-bold text-ink">
                  Course Curriculum
                </h2>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-6 text-center text-sm text-slate-400">
                Loading curriculum...
              </div>
            </section>
          ) : (
            <CourseCurriculum sections={curriculum} />
          )}
        </div>

        <div className="space-y-6">
          <EnrollCard course={course} />

          <InstructorBio name={course.instructor_name} />
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-bold text-ink">
          You might also like
        </h2>

        <div className="grid gap-5 sm:grid-cols-3">
          {courses
            .filter(
              (item) =>
                Number(item.id) !== Number(course.id) &&
                Number(item.category_id) ===
                  Number(course.category_id)
            )
            .slice(0, 3)
            .map((item) => (
              <Link
                key={item.id}
                to={`/courses/${item.id}`}
                className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className="h-20 w-full rounded-lg"
                  style={{
                    backgroundColor:
                      item.thumbnail_color || '#2E7D32',
                  }}
                />

                <h3 className="mt-3 line-clamp-2 text-sm font-bold text-ink">
                  {item.title}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {item.instructor_name}
                </p>
              </Link>
            ))}
        </div>
      </section>
    </main>
  )
}