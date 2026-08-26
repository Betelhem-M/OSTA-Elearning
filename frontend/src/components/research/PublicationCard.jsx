import { useState } from "react";
import {
  FileText,
  ChevronDown,
  ExternalLink,
  Lock,
  UserRound,
} from "lucide-react";

export default function PublicationCard({
  publication,
  isAuthenticated = false,
  isResearcher = false,
}) {
  const [expanded, setExpanded] =
    useState(false);

  const publicPreview =
    publication.abstract
      ? `${publication.abstract.slice(
          0,
          220
        )}${
          publication.abstract.length >
          220
            ? "..."
            : ""
        }`
      : "No abstract preview is available.";

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
          <FileText size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold leading-5 text-ink">
            {publication.title}
          </h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <UserRound size={12} />
              {publication.researcher_name ||
                "Researcher"}
            </span>

            <span>·</span>

            <span>
              {publication.publication_year ||
                "Year not specified"}
            </span>
          </div>

          {publication.field && (
            <span className="mt-3 inline-block rounded-full bg-primary-light px-2.5 py-1 text-[10px] font-bold text-primary">
              {publication.field}
            </span>
          )}

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {expanded
              ? publication.abstract ||
                "No abstract available."
              : publicPreview}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {isResearcher ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setExpanded(
                      (value) =>
                        !value
                    )
                  }
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  {expanded
                    ? "Hide abstract"
                    : "Read abstract"}

                  <ChevronDown
                    size={13}
                    className={`transition-transform ${
                      expanded
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {publication.publication_url && (
                  <a
                    href={
                      publication.publication_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary"
                  >
                    Open publication
                    <ExternalLink
                      size={12}
                    />
                  </a>
                )}
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Lock size={12} />
                Public preview
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}