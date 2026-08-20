export default function InstructorBio({ name }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter((c) => c === c.toUpperCase())
    .slice(0, 2)
    .join('')

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <h2 className="mb-3 text-sm font-bold text-ink">Instructor</h2>
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
          {initials}
        </span>
        <div>
          <p className="text-sm font-bold text-ink">{name}</p>
          <p className="text-xs text-slate-400">OSTA Faculty</p>
        </div>
      </div>
    </section>
  )
}