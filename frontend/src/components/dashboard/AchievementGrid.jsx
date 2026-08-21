import * as Icons from 'lucide-react'

export default function AchievementGrid({ achievements, onViewAll }) {
  return (
    <section aria-labelledby="achievements-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="achievements-title" className="text-lg font-bold text-ink">
          Achievements
        </h2>
        <button onClick={onViewAll} className="text-xs font-bold text-primary hover:underline">
          View All
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {achievements.map((badge) => {
          const Icon = Icons[badge.icon] || Icons.Award
          return (
            <div key={badge.id} className="flex flex-col items-center gap-1.5 text-center">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  badge.earned ? 'bg-gold/15 text-gold' : 'bg-slate-100 text-slate-300'
                }`}
              >
                <Icon size={22} />
              </span>
              <p className={`text-[10px] font-semibold leading-tight ${badge.earned ? 'text-ink' : 'text-slate-400'}`}>
                {badge.label}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}