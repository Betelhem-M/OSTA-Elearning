import { useState } from 'react'
import { FileText, ChevronDown } from 'lucide-react'

export default function PublicationCard({ publication }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <div className="flex items-start gap-3">
        <FileText size={18} className="mt-0.5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-ink">{publication.title}</h3>
          <p className="mt-0.5 text-xs text-slate-400">{publication.authors} · {publication.year}</p>
          <span className="mt-2 inline-block rounded-full bg-primary-light px-2.5 py-1 text-[10px] font-bold text-primary">
            {publication.field}
          </span>

          {expanded && <p className="mt-3 text-xs leading-5 text-slate-600">{publication.abstract}</p>}

          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            {expanded ? 'Hide abstract' : 'Read abstract'}
            <ChevronDown size={13} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  )
}