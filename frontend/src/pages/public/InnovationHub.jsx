import { useState } from 'react'
import { hackathons, innovationIdeas, startups, innovationStats } from '@mocks/innovationData'
import HackathonCard from '@components/innovation/HackathonCard'
import InnovationIdeaCard from '@components/innovation/InnovationIdeaCard'
import StartupCard from '@components/innovation/StartupCard'
import SubmitIdeaForm from '@components/innovation/SubmitIdeaForm'

let nextIdeaId = 100

export default function InnovationHub() {
  const [ideas, setIdeas] = useState(innovationIdeas)

  function handleAddIdea(newIdea) {
    setIdeas((prev) => [{ ...newIdea, id: nextIdeaId++ }, ...prev])
  }

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-extrabold text-ink">Innovation Hub</h1>
      <p className="mt-1 text-sm text-slate-500">Hackathons, ideas, and startups from OSTA's community.</p>

      <div className="mt-5 grid grid-cols-3 gap-4">
        {innovationStats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-100 bg-white p-4 text-center">
            <p className="text-xl font-extrabold text-primary">{stat.value}</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-ink">Active Hackathons</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hackathons.map((h) => (
            <HackathonCard key={h.id} hackathon={h} />
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <h2 className="mb-3 text-lg font-bold text-ink">Innovation Ideas</h2>
          <div className="space-y-3">
            {ideas.map((idea) => (
              <InnovationIdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </section>

        <SubmitIdeaForm onSubmit={handleAddIdea} />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-ink">Startups from OSTA</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {startups.map((s) => (
            <StartupCard key={s.id} startup={s} />
          ))}
        </div>
      </section>
    </main>
  )
}