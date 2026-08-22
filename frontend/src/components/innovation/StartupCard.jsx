export default function StartupCard({ startup }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <h3 className="text-sm font-bold text-ink">{startup.name}</h3>
      <p className="mt-0.5 text-xs text-slate-400">Founded by {startup.founder}</p>
      <div className="mt-2 flex gap-2">
        <span className="rounded-full bg-primary-light px-2.5 py-1 text-[10px] font-bold text-primary">{startup.category}</span>
        <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-bold text-gold-dark">{startup.stage}</span>
      </div>
    </div>
  )
}