import {
  ExternalLink,
  Globe,
  MapPin,
  Verified,
} from "lucide-react";

import CountdownTimer from "./CountdownTimer";

function formatFormat(value) {
  switch (value) {
    case "in_person":
      return "In person";

    case "hybrid":
      return "Hybrid";

    default:
      return "Online";
  }
}

function formatDate(value) {
  if (!value) {
    return "Deadline not specified";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

export default function CompetitionCard({
  competition,
}) {
  const isExternal =
    competition.source_type ===
    "external";

  const isClosed =
    competition.status ===
      "closed" ||
    competition.status ===
      "completed" ||
    (competition.deadline &&
      new Date(
        competition.deadline
      ).getTime() <=
        Date.now());

  const registrationUrl =
    competition.registration_url ||
    null;

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition hover:-translate-y-0.5 hover:shadow-md">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                isExternal
                  ? "bg-slate-100 text-slate-600"
                  : "bg-primary-light text-primary"
              }`}
            >
              {isExternal
                ? "External"
                : "OSTA"}
            </span>

            {competition.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-600">
                <Verified
                  size={11}
                />
                Verified
              </span>
            )}
          </div>

          <h3 className="mt-3 text-sm font-extrabold text-ink">
            {competition.title}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {competition.organizer ||
              "Organizer not specified"}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            isClosed
              ? "bg-slate-100 text-slate-500"
              : "bg-primary-light text-primary"
          }`}
        >
          {isClosed
            ? "Closed"
            : competition.status ||
              "Open"}
        </span>
      </div>

      {/* CATEGORY */}

      {competition.category && (
        <p className="mt-3 text-xs font-semibold text-slate-500">
          {competition.category}
        </p>
      )}

      {/* DESCRIPTION */}

      {competition.description && (
        <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-500">
          {competition.description}
        </p>
      )}

      {/* DETAILS */}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <Globe
            size={14}
            className="mt-0.5 shrink-0 text-primary"
          />

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Format
            </p>

            <p className="text-xs font-semibold text-slate-600">
              {formatFormat(
                competition.format
              )}
            </p>
          </div>
        </div>

        {competition.location && (
          <div className="flex items-start gap-2">
            <MapPin
              size={14}
              className="mt-0.5 shrink-0 text-primary"
            />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Location
              </p>

              <p className="line-clamp-1 text-xs font-semibold text-slate-600">
                {
                  competition.location
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DEADLINE */}

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Registration deadline
        </p>

        {isClosed ? (
          <div>
            <p className="text-xs font-bold text-slate-400">
              {formatDate(
                competition.deadline
              )}
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              Registration closed
            </p>
          </div>
        ) : (
          <CountdownTimer
            targetDate={
              competition.deadline
            }
          />
        )}
      </div>

      {/* PRIZE */}

      {competition.prize && (
        <div className="mt-4 rounded-lg bg-primary-light px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
            Prize
          </p>

          <p className="mt-0.5 text-xs font-bold text-ink">
            {competition.prize}
          </p>
        </div>
      )}

      {/* REGISTER */}

      <div className="mt-5">
        {isClosed ? (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-slate-100 py-2.5 text-xs font-bold text-slate-400"
          >
            Registration Closed
          </button>
        ) : registrationUrl ? (
          <a
            href={
              registrationUrl
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-bold text-white transition hover:bg-primary-hover"
          >
            {isExternal
              ? "Register on Official Site"
              : "Register Now"}

            <ExternalLink
              size={14}
            />
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-slate-100 py-2.5 text-xs font-bold text-slate-400"
          >
            Registration Details Coming Soon
          </button>
        )}
      </div>

      {/* OFFICIAL SOURCE */}

      {isExternal &&
        competition.source_url && (
          <a
            href={
              competition.source_url
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-primary hover:underline"
          >
            View official opportunity
            <ExternalLink
              size={11}
            />
          </a>
        )}
    </article>
  );
}