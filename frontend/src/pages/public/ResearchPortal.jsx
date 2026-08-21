import { useState, useMemo } from 'react'
import { publications, researchers } from '@mocks/researchData'
import ResearchSearchBar from '@components/research/ResearchSearchBar'
import PublicationCard from '@components/research/PublicationCard'
import ResearcherProfileCard from '@components/research/ResearcherProfileCard'

export default function ResearchPortal() {
  const [search, setSearch] = useState('')
  const [field, setField] = useState('All')

  const filtered = useMemo(() => {
    return publications.filter((pub) => {
      if (field !== 'All' && pub.field !== field) return false
      if (search) {
        const q = search.toLowerCase()
        if (!pub.title.toLowerCase().includes(q) && !pub.authors.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [search, field])

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-extrabold text-ink">Research Portal</h1>
      <p className="mt-1 text-sm text-slate-500">Browse publications and researchers across OSTA's programs.</p>

      <div className="mt-6">
        <ResearchSearchBar search={search} onSearchChange={setSearch} field={field} onFieldChange={setField} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <p className="mb-3 text-xs text-slate-400">{filtered.length} publication{filtered.length === 1 ? '' : 's'}</p>
          <div className="space-y-3">
            {filtered.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
            {filtered.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">No publications match your search.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold text-ink">Featured Researchers</h2>
          <div className="space-y-3">
            {researchers.map((r) => (
              <ResearcherProfileCard key={r.id} researcher={r} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}