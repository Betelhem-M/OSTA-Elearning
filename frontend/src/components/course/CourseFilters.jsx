import { Search } from 'lucide-react'
import { categories, levels } from '@mocks/courses'

const TABS = ['All', 'Popular', 'Newest', 'Free']
const SORT_OPTIONS = [
  { value: '', label: 'Sort By' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'students', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
]

export default function CourseFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  level,
  onLevelChange,
  sort,
  onSortChange,
  tab,
  onTabChange,
}) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search courses, instructors, topics..."
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => onCategoryChange(c)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              category === c ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-primary'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-1">
        <div className="flex gap-5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`border-b-2 pb-3 text-sm font-semibold transition ${
                tab === t ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pb-2">
          <select
            value={level}
            onChange={(e) => onLevelChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:border-primary"
          >
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:border-primary"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}