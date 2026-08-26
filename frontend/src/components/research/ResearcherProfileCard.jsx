import {
  BookOpen,
  UserRound,
  ArrowRight,
} from "lucide-react";

export default function ResearcherProfileCard({
  researcher,
}) {
  const name =
    researcher.name ||
    "Researcher";

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (word) =>
          word[0]
      )
      .join("")
      .toUpperCase() ||
    "R";

  const publicationCount =
    Number(
      researcher.publication_count ??
        researcher.publications ??
        0
    );

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
          {initials}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">
            {name}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {researcher.field ||
              "Researcher"}
          </p>

          {researcher.affiliation && (
            <p className="mt-1 text-[11px] text-slate-400">
              {researcher.affiliation}
            </p>
          )}

          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <BookOpen
              size={13}
              className="text-primary"
            />

            {publicationCount} publication
            {publicationCount ===
            1
              ? ""
              : "s"}
          </div>
        </div>
      </div>

      {researcher.bio && (
        <p className="mt-4 line-clamp-3 text-xs leading-5 text-slate-500">
          {researcher.bio}
        </p>
      )}

      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary">
        <UserRound size={13} />
        Research profile
        <ArrowRight size={13} />
      </div>
    </article>
  );
}