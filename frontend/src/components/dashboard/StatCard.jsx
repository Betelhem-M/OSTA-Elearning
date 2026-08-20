import * as Icons from 'lucide-react'

export default function StatCard({ icon, label, value, trend, trendPositive = true }) {
  const Icon = Icons[icon] || Icons.Activity

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
          <Icon size={20} />
        </span>
        {trend && (
          <span className={`text-xs font-bold ${trendPositive ? 'text-primary' : 'text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-extrabold text-ink">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
    </div>
  )
}