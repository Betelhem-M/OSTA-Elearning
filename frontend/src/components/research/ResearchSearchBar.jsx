import { Search } from 'lucide-react'
import { researchFields } from '@mocks/researchData'

export default function ResearchSearchBar({ search, onSearchChange, field, onFieldChange }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search publications, authors, keywords..."
          className="h-11 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>
      <select
        value={field}
        onChange={(e) => onFieldChange(e.target.value)}
        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-primary"
      >
        {researchFields.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
    </div>
  )
}