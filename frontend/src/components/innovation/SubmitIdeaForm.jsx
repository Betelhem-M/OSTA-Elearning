import { useState } from 'react'

const CATEGORIES = ['Agriculture', 'AI & ML', 'HealthTech', 'EdTech', 'FinTech', 'Other']

export default function SubmitIdeaForm({ onSubmit }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    if (!title.trim() || !description.trim()) {
      setError('Fill in both the title and description before submitting.')
      return
    }
    setError('')
    onSubmit({ title: title.trim(), category, author: 'You', votes: 0 })
    setTitle('')
    setDescription('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <h2 className="text-sm font-bold text-ink">Submit Your Idea</h2>

      <label className="mt-4 block text-xs font-bold text-slate-600" htmlFor="idea-title">
        Idea Title
      </label>
      <input
        id="idea-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Solar-powered water pump monitor"
        className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary"
      />

      <label className="mt-4 block text-xs font-bold text-slate-600" htmlFor="idea-category">
        Category
      </label>
      <select
        id="idea-category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <label className="mt-4 block text-xs font-bold text-slate-600" htmlFor="idea-description">
        Description
      </label>
      <textarea
        id="idea-description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your idea and the problem it solves..."
        className="mt-1.5 min-h-[90px] w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-primary"
      />

      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
      {success && <p className="mt-2 text-xs font-semibold text-primary">Idea submitted — thanks for contributing!</p>}

      <button type="submit" className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-hover">
        Submit Idea
      </button>
    </form>
  )
}