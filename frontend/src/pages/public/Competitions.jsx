import { competitions, leaderboard } from '@mocks/competitionsData'
import CompetitionCard from '@components/competition/CompetitionCard'
import Leaderboard from '@components/competition/Leaderboard'

export default function Competitions() {
  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-extrabold text-ink">Competitions</h1>
      <p className="mt-1 text-sm text-slate-500">Compete, learn, and win with OSTA's community challenges.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="grid gap-4 sm:grid-cols-2">
          {competitions.map((c) => (
            <CompetitionCard key={c.id} competition={c} />
          ))}
        </section>

        <Leaderboard entries={leaderboard} />
      </div>
    </main>
  )
}