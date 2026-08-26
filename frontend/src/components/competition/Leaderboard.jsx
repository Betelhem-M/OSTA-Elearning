import {
  Trophy,
  Users,
} from "lucide-react";

export default function Leaderboard({
  entries = [],
}) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
          <Trophy
            size={18}
          />
        </span>

        <div>
          <h2 className="text-sm font-bold text-ink">
            Competition Results
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Leaderboards will appear here when OSTA competition
            results are published.
          </p>
        </div>
      </div>

      {entries.length >
      0 ? (
        <ul className="mt-5 space-y-2">
          {entries.map(
            (entry) => (
              <li
                key={
                  entry.rank
                }
                className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                  {entry.rank}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">
                    {entry.name}
                  </p>

                  {entry.team && (
                    <p className="text-[11px] text-slate-400">
                      {
                        entry.team
                      }
                    </p>
                  )}
                </div>

                <span className="text-xs font-bold text-primary">
                  {entry.score} pts
                </span>
              </li>
            )
          )}
        </ul>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-7 text-center">
          <Users
            size={28}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 text-xs font-semibold text-slate-500">
            No public results yet
          </p>
        </div>
      )}
    </section>
  );
}