import { useState } from 'react'
import { Trophy, Users, Calendar } from 'lucide-react'

export default function HackathonCard({ hackathon }) {
  const [isRegistered, setIsRegistered] = useState(false)
  const isClosed = hackathon.status === 'Closed'

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-extrabold text-ink">{hackathon.title}</h3>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${isClosed ? 'bg-slate-100 text-slate-500' : 'bg-primary-light text-primary'}`}>
          {hackathon.status}
        </span>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-slate-500">
        <p className="flex items-center gap-1.5"><Calendar size={13} /> Deadline: {hackathon.deadline}</p>
        <p className="flex items-center gap-1.5"><Trophy size={13} /> Prize: {hackathon.prize}</p>
        <p className="flex items-center gap-1.5"><Users size={13} /> {hackathon.teams} teams registered</p>
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
        {isRegistered ? 'Registered ✓' : isClosed ? 'Registration Closed' : 'Register Now'}
      </button>
    </div>
  )
}