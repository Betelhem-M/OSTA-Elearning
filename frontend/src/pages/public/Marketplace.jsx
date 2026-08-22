import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CourseFilters from '@components/course/CourseFilters'
import CourseGrid from '@components/course/CourseGrid'

const API_URL = 'http://localhost:5000/api'

export default function Marketplace() {
  const [searchParams] = useSearchParams()

  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(
    searchParams.get('category') || 'All'
  )
  const [level, setLevel] = useState('All Levels')
  const [sort, setSort] = useState('')
  const [tab, setTab] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch courses from the backend
  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_URL}/courses`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch courses')
        }

        setCourses(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Marketplace error:', err)
        setError(err.message || 'Failed to load courses')
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  // Generate categories from real backend courses
  const categories = useMemo(() => {
    return [
      'All',
      ...new Set(
        courses
          .map((course) => course.category_name)
          .filter(Boolean)
      ),
    ]
  }, [courses])

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = courses.filter((course) => {
      // Category
      if (
        category !== 'All' &&
        course.category_name !== category
      ) {
        return false
      }

      // Level
      if (
        level !== 'All Levels' &&
        course.level !== level
      ) {
        return false
      }

      // Free tab
      if (tab === 'Free') {
        const price = Number(course.price)

        if (price !== 0) {
          return false
        }
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim()

        const matches =
          course.title?.toLowerCase().includes(q) ||
          course.instructor_name?.toLowerCase().includes(q) ||
          course.category_name?.toLowerCase().includes(q) ||
          course.description?.toLowerCase().includes(q)

        if (!matches) {
          return false
        }
      }

      return true
    })

    // Popular tab
    if (tab === 'Popular') {
      result = [...result].sort(
        (a, b) =>
          Number(b.students || 0) -
          Number(a.students || 0)
      )
    }

    // Newest tab
    if (tab === 'Newest') {
      result = [...result].sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )
    }

    // Sort dropdown
    if (sort === 'rating') {
      result = [...result].sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      )
    }

    if (sort === 'students') {
      result = [...result].sort(
        (a, b) =>
          Number(b.students || 0) -
          Number(a.students || 0)
      )
    }

    if (sort === 'newest') {
      result = [...result].sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )
    }

    return result
  }, [
    courses,
    search,
    category,
    level,
    sort,
    tab,
  ])

  if (loading) {
    return (
      <main className="mx-auto max-w-[1200px] px-5 py-16 lg:px-10">
        <div className="text-center text-sm font-semibold text-slate-500">
          Loading courses...
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-[1200px] px-5 py-16 lg:px-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="font-bold text-red-700">
            Failed to load courses
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <p className="mt-3 text-xs text-red-500">
            Make sure your backend server and MySQL are running.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-extrabold text-ink">
        Course Marketplace
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Browse {courses.length} course
        {courses.length === 1 ? '' : 's'} across technology,
        research, and innovation.
      </p>

      <div className="mt-6">
        <CourseFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
          level={level}
          onLevelChange={setLevel}
          sort={sort}
          onSortChange={setSort}
          tab={tab}
          onTabChange={setTab}
        />
      </div>

      <p className="mt-5 text-xs text-slate-400">
        {filteredCourses.length} course
        {filteredCourses.length === 1 ? '' : 's'}
      </p>

      <div className="mt-3">
        <CourseGrid courses={filteredCourses} />
      </div>
    </main>
  )
}