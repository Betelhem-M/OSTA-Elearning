import { useState } from 'react'

export default function ReplyThread({ topic, replies, onAddReply }) {
  const [draft, setDraft] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!draft.trim()) return
    onAddReply(topic.id, draft.trim())
    setDraft('')
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{topic.category}</span>
      <h2 className="mt-2 text-lg font-extrabold text-ink">{topic.title}</h2>
      <p className="mt-1 text-xs text-slate-400">{topic.author} · {topic.createdAgo}</p>
      <p className="mt-4 text-sm leading-6 text-slate-600">{topic.body}</p>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h3>

        <div className="mt-3 space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="rounded-lg bg-surface p-3">
              <p className="text-xs font-bold text-ink">{reply.author}</p>
              <p className="mt-1 text-sm text-slate-600">{reply.text}</p>
            </div>
          ))}
          {replies.length === 0 && <p className="text-sm text-slate-400">No replies yet — be the first to respond.</p>}
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a reply..."
            className="min-h-[70px] w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-primary"
          />
          <button type="submit" className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover">
            Post Reply
          </button>
        </form>
      </div>
    </div>
  )
}