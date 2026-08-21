import { useState } from 'react'
import { ArrowBigUp } from 'lucide-react'

export default function InnovationIdeaCard({ idea }) {
  const [votes, setVotes] = useState(idea.votes)
  const [hasVoted, setHasVoted] = useState(false)

  function handleVote() {
    if (hasVoted) return
    setVotes((v) => v + 1)
    setHasVoted(true)
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4">
      <button
        onClick={handleVote}
        disabled={hasVoted}
        aria-pressed={hasVoted}
        className={`flex flex-col items-center rounded-lg border px-3 py-2 transition ${
          hasVoted ? 'border-primary bg-primary-light text-primary' : 'border-slate-200 text-slate-500 hover:border-primary hover:text-primary'
        }`}
      >
        <ArrowBigUp size={16} fill={hasVoted ? 'currentColor' : 'none'} />
        <span className="text-xs font-bold">{votes}</span>
      </button>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-ink">{idea.title}</h3>
        <p className="text-xs text-slate-400">by {idea.author} · {idea.category}</p>
      </div>
    </div>
  )
}