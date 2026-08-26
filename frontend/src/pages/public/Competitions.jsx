import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  RefreshCw,
  Search,
  Trophy,
} from "lucide-react";

import CompetitionCard from "@components/competition/CompetitionCard";

import {
  apiRequest,
} from "@services/api";

function normalizeStatus(
  competition
) {
  const status =
    String(
      competition.status ||
        ""
    ).toLowerCase();

  if (
    status ===
      "completed" ||
    status ===
      "closed"
  ) {
    return "Closed";
  }

  if (
    status ===
      "upcoming"
  ) {
    return "Upcoming";
  }

  if (
    status ===
      "active" ||
    status ===
      "published"
  ) {
    return "Open";
  }

  if (
    competition.deadline
  ) {
    const deadline =
      new Date(
        competition.deadline
      ).getTime();

    if (
      Number.isFinite(
        deadline
      ) &&
      deadline <=
        Date.now()
    ) {
      return "Closed";
    }
  }

  return "Open";
}

export default function Competitions() {
  const [
    competitions,
    setCompetitions,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("All");

  const [
    sourceType,
    setSourceType,
  ] = useState("All");

  // =====================================================
  // LOAD REAL HACKATHONS
  // =====================================================

  async function loadCompetitions({
    refresh = false,
  } = {}) {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data =
        await apiRequest(
          "/hackathons"
        );

      const normalized =
        Array.isArray(data)
          ? data.map(
              (item) => ({
                ...item,
                status:
                  normalizeStatus(
                    item
                  ),
              })
            )
          : [];

      setCompetitions(
        normalized
      );
    } catch (err) {
      console.error(
        "Competitions error:",
        err
      );

      setError(
        err.message ||
          "Failed to load hackathons."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCompetitions();
  }, []);

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories =
    useMemo(() => {
      const values =
        competitions
          .map(
            (item) =>
              item.category
          )
          .filter(Boolean);

      return [
        "All",
        ...Array.from(
          new Set(values)
        ),
      ];
    }, [competitions]);

  // =====================================================
  // FILTER
  // =====================================================

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return competitions.filter(
        (competition) => {
          const textMatches =
            !query ||
            String(
              competition.title ||
                ""
            )
              .toLowerCase()
              .includes(query) ||
            String(
              competition.organizer ||
                ""
            )
              .toLowerCase()
              .includes(query) ||
            String(
              competition.description ||
                ""
            )
              .toLowerCase()
              .includes(query);

          const categoryMatches =
            category ===
              "All" ||
            competition.category ===
              category;

          const sourceMatches =
            sourceType ===
              "All" ||
            competition.source_type ===
              sourceType;

          return (
            textMatches &&
            categoryMatches &&
            sourceMatches
          );
        }
      );
    }, [
      competitions,
      search,
      category,
      sourceType,
    ]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="mx-auto max-w-[1100px] px-5 py-10 lg:px-10">
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <Trophy
            size={40}
            className="mx-auto animate-pulse text-primary/40"
          />

          <h1 className="mt-4 text-lg font-bold text-ink">
            Loading OSTA Notice
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Finding the latest hackathons and competition opportunities.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 lg:px-10">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden rounded-2xl bg-[#0F172A] p-7 text-white shadow-lg sm:p-9">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <Trophy
                size={23}
              />
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
              OSTA Notice
            </span>
          </div>

          <h1 className="mt-5 max-w-3xl text-2xl font-extrabold sm:text-3xl">
            Discover hackathons and competition opportunities
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Find OSTA competitions and selected external
            opportunities in one place. External registrations
            always take you to the organizer's official site.
          </p>
        </div>
      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              loadCompetitions({
                refresh:
                  true,
              })
            }
            className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:underline"
          >
            <RefreshCw
              size={13}
            />
            Try Again
          </button>
        </div>
      )}

      {/* =================================================
          SEARCH + FILTERS
      ================================================= */}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search competitions..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["All", "All"],
              ["OSTA", "osta"],
              [
                "External",
                "external",
              ],
            ].map(
              ([label, value]) => (
                <button
                  key={
                    value
                  }
                  type="button"
                  onClick={() =>
                    setSourceType(
                      value
                    )
                  }
                  className={`rounded-full px-3 py-2 text-xs font-bold ${
                    sourceType ===
                    value
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setCategory(
                    item
                  )
                }
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                  category ===
                  item
                    ? "bg-primary text-white"
                    : "border border-slate-200 text-slate-500 hover:border-primary hover:text-primary"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>
      </section>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">
            Opportunities
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink">
            {
              competitions.length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">
            External
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink">
            {
              competitions.filter(
                (item) =>
                  item.source_type ===
                  "external"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">
            Showing
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink">
            {filtered.length}
          </p>
        </div>
      </div>

      {/* =================================================
          LIST
      ================================================= */}

      <section className="mt-7">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">
              Hackathon Opportunities
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Opportunities currently published on OSTA.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadCompetitions({
                refresh:
                  true,
              })
            }
            disabled={
              refreshing
            }
            className="inline-flex items-center gap-2 text-xs font-bold text-primary disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {filtered.length ===
        0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Trophy
              size={40}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 text-base font-bold text-ink">
              No hackathon opportunities yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Published OSTA and external hackathons will appear
              here when they are added to the platform.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filtered.map(
              (competition) => (
                <CompetitionCard
                  key={
                    competition.id
                  }
                  competition={
                    competition
                  }
                />
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}