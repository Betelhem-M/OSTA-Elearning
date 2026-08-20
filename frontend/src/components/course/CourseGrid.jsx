import CourseCard from './CourseCard'

export default function CourseGrid({ courses }) {
  if (courses.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-slate-400">
        No courses match your search or filters.
      </p>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}