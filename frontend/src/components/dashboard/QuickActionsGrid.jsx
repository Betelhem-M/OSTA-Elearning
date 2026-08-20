import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'

export default function QuickActionsGrid({ actions }) {
  return (
    <section aria-labelledby="actions-title">
      <h2 id="actions-title" className="mb-3 text-lg font-bold text-ink">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = Icons[action.icon] || Icons.Circle
          return (
            <Link
              key={action.href}
              to={action.href}
              className="flex min-h-[94px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white text-sm font-semibold text-slate-700 shadow-[0_3px_12px_rgba(15,23,42,0.04)] transition hover:border-primary/30 hover:text-primary"
            >
              <Icon size={22} />
              {action.label}
            </Link>
          )
        })}
      </div>
    </section>
  )
}