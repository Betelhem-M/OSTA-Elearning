import { useState } from 'react'
import CountdownTimer from './CountdownTimer'

export default function CompetitionCard({ competition }) {
  const [isRegistered, setIsRegistered] = useState(false)
  const isClosed = competition.status === 'Closed'

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-extrabold text-ink">{competition.title}</h3>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${isClosed ? 'bg-slate-100 text-slate-500' : 'bg-primary-light text-primary'}`}>
          {competition.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">{competition.category}</p>

      <div className="mt-4">
        {isClosed ? (
          <span className="text-xs font-semibold text-slate-400">Registration closed</span>
        ) : (
          <CountdownTimer targetDate={competition.deadline} />
        )}
      </div>

      <button
        onClick={() => setIsRegistered(true)}
        disabled={isClosed || isRegistered}
        className={`mt-4 w-full rounded-lg py-2.5 text-xs font-bold transition ${
          isRegistered
            ? 'cursor-default bg-primary-light text-primary'
            : isClosed
            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
            : 'bg-primary text-white hover:bg-primary-hover'
        }`}
      >
        {isRegistered ? 'Registered ✓' : isClosed ? 'Closed' : 'Register Now'}
      </button>
    </div>
  )
}