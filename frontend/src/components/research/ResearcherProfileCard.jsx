export default function ResearcherProfileCard({ researcher }) {
  const initials = researcher.name.split(' ').filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).slice(0, 2).join('')

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
        {initials}
      </span>
      <div>
        <p className="text-sm font-bold text-ink">{researcher.name}</p>
        <p className="text-xs text-slate-400">{researcher.field} · {researcher.publications} publications</p>
      </div>
    </div>
  )
}