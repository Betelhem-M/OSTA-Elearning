import { Medal } from 'lucide-react'

export default function Leaderboard({ entries }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <h2 className="text-sm font-bold text-ink">Leaderboard</h2>
      <ul className="mt-4 space-y-2">
        {entries.map((entry) => (
          <li key={entry.rank} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              entry.rank <= 3 ? 'bg-gold/20 text-gold-dark' : 'bg-slate-100 text-slate-500'
            }`}>
              {entry.rank <= 3 ? <Medal size={14} /> : entry.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-ink">{entry.name}</p>
              <p className="text-[11px] text-slate-400">{entry.team}</p>
            </div>
            <span className="shrink-0 text-xs font-bold text-primary">{entry.score} pts</span>
          </li>
        ))}
      </ul>
    </section>
  )
}