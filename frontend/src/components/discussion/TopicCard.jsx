import { MessageCircle } from 'lucide-react'

export default function TopicCard({ topic, onClick, isActive }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left transition ${
        isActive ? 'border-primary bg-primary-light' : 'border-slate-100 bg-white hover:border-primary/40'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{topic.category}</span>
        <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
          <MessageCircle size={13} /> {topic.replies}
        </span>
      </div>
      <h3 className="mt-2 text-sm font-bold text-ink">{topic.title}</h3>
      <p className="mt-1 text-xs text-slate-400">{topic.author} · {topic.createdAgo}</p>
    </button>
  )
}