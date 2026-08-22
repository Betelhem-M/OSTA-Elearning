import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, Users } from 'lucide-react'

export default function CourseCard({ course }) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const price =
    Number(course.price) === 0
      ? 'FREE'
      : `$${course.price}`

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(15,23,42,0.1)]">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          setIsWishlisted((value) => !value)
        }}
        aria-label={
          isWishlisted
            ? `Remove ${course.title} from wishlist`
            : `Add ${course.title} to wishlist`
        }
        aria-pressed={isWishlisted}
        className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 transition ${
          isWishlisted
            ? 'text-primary'
            : 'text-slate-400 hover:text-primary'
        }`}
      >
        <Heart
          size={18}
          fill={
            isWishlisted
              ? 'currentColor'
              : 'none'
          }
        />
      </button>

      <Link to={`/courses/${course.id}`}>
        {/* Thumbnail */}
        <div
          className="h-32 w-full"
          style={{
            backgroundColor:
              course.thumbnail_color || '#2E7D32',
          }}
        />

        <div className="p-4">
          {/* Category */}
          <span className="rounded-full bg-primary-light px-2.5 py-1 text-[10px] font-bold text-primary">
            {course.category_name}
          </span>

          {/* Title */}
          <h3 className="mt-2.5 line-clamp-2 text-sm font-bold text-ink">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="mt-1 text-xs text-slate-500">
            {course.instructor_name}
          </p>

          {/* Rating + Students */}
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            {course.rating != null && (
              <span className="flex items-center gap-1">
                <Star
                  size={13}
                  className="fill-gold text-gold"
                />
                {course.rating}
              </span>
            )}

            {course.students != null && (
              <span className="flex items-center gap-1">
                <Users size={13} />
                {Number(course.students).toLocaleString()}
              </span>
            )}
          </div>

          {/* Level + Price */}
          <div className="mt-3 flex items-center justify-between">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
              {course.level}
            </span>

            <span className="text-sm font-extrabold text-primary">
              {price}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}