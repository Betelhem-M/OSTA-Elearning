import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { courses } from '@mocks/courses'
import CourseFilters from '@components/course/CourseFilters'
import CourseGrid from '@components/course/CourseGrid'

export default function Marketplace() {
  const [search, setSearch] = useState('')
  
  // Clean parameter initialization on separate lines
  const [searchParams] = useSearchParams()
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  
  const [level, setLevel] = useState('All Levels')
  const [sort, setSort] = useState('')
  const [tab, setTab] = useState('All')

  const filteredCourses = useMemo(() => {
    let result = courses.filter((course) => {
      if (category !== 'All' && course.category !== category) return false
      if (level !== 'All Levels' && course.level !== level) return false
      if (tab === 'Free' && course.price !== 'FREE') return false
      if (search) {
        const q = search.toLowerCase()
        const matches =
          course.title.toLowerCase().includes(q) ||
          course.instructor.toLowerCase().includes(q) ||
          course.category.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })

    const sortKey = tab === 'Popular' ? 'students' : sort

    if (sortKey === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating)
    } else if (sortKey === 'students') {
      result = [...result].sort((a, b) => b.students - a.students)
    } else if (sortKey === 'newest' || tab === 'Newest') {
      // No real publish-date data exists in this build, so "Newest" simulates
      // recency by reversing catalog order — same honest approach used
      // throughout this project rather than fabricating dates.
      result = [...result].reverse()
    }

    return result
  }, [search, category, level, sort, tab])

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-extrabold text-ink">Course Marketplace</h1>
      <p className="mt-1 text-sm text-slate-500">
        Browse {courses.length} free courses across technology, research, and innovation.
      </p>

      <div className="mt-6">
        <CourseFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          level={level}
          onLevelChange={setLevel}
          sort={sort}
          onSortChange={setSort}
          tab={tab}
          onTabChange={setTab}
        />
      </div>

      <p className="mt-5 text-xs text-slate-400">
        {filteredCourses.length} course{filteredCourses.length === 1 ? '' : 's'}
      </p>

      <div className="mt-3">
        <CourseGrid courses={filteredCourses} />
      </div>
    </main>
  )
}
