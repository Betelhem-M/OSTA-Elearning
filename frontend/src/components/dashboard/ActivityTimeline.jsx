import { Link } from 'react-router-dom'
import { Clock, AlertTriangle } from 'lucide-react'

export default function ActivityTimeline({ deadlines }) {
  return (
    <section aria-labelledby="deadlines-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="deadlines-title" className="text-lg font-bold text-ink">
          Upcoming Deadlines
        </h2>
        <Link to="/events" className="text-xs font-semibold text-primary hover:underline">
          View calendar
        </Link>
      </div>

      <ul className="space-y-2.5">
        {deadlines.map((item) => (
          <li key={item.id}>
            <Link
              to="/events"
              className={`flex min-h-[72px] items-center gap-3 rounded-xl border border-l-4 bg-white px-3.5 py-3 shadow-[0_3px_12px_rgba(15,23,42,0.04)] transition hover:shadow-md ${
                item.urgent ? 'border-red-400' : 'border-primary'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  item.urgent ? 'bg-red-50 text-red-500' : 'bg-primary-light text-primary'
                }`}
              >
                {item.urgent ? <AlertTriangle size={16} /> : <Clock size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{item.title}</p>
                <p className="truncate text-xs text-slate-400">{item.course}</p>
              </div>
              <span
                className={`shrink-0 text-xs font-bold ${item.urgent ? 'text-red-500' : 'text-slate-500'}`}
              >
                {item.dueLabel}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}