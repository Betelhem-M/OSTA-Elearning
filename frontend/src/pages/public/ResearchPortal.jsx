import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  FlaskConical,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import ResearchSearchBar from "@components/research/ResearchSearchBar";
import PublicationCard from "@components/research/PublicationCard";
import ResearcherProfileCard from "@components/research/ResearcherProfileCard";

import { apiRequest } from "@services/api";
import { useAuth } from "@context/AuthContext";

export default function ResearchPortal() {
  const {
    user,
    isAuthenticated,
  } = useAuth();

  const isResearcher =
    isAuthenticated &&
    user?.account_type ===
      "researcher";

  const [
    publications,
    setPublications,
  ] = useState([]);

  const [
    researchers,
    setResearchers,
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
    field,
    setField,
  ] = useState("All");

  // =====================================================
  // LOAD REAL RESEARCH DATA
  // =====================================================

  async function loadResearch({
    refresh = false,
  } = {}) {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        publicationsResponse,
        researchersResponse,
      ] = await Promise.all([
        apiRequest(
          "/research/publications"
        ),
        apiRequest(
          "/research/researchers"
        ),
      ]);

      setPublications(
        Array.isArray(
          publicationsResponse
        )
          ? publicationsResponse
          : []
      );

      setResearchers(
        Array.isArray(
          researchersResponse
        )
          ? researchersResponse
          : []
      );
    } catch (err) {
      console.error(
        "Research portal error:",
        err
      );

      setError(
        err.message ||
          "Failed to load research data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadResearch();
  }, []);

  // =====================================================
  // REAL FIELDS
  // =====================================================

  const researchFields =
    useMemo(() => {
      const values =
        publications
          .map(
            (publication) =>
              publication.field
          )
          .filter(Boolean);

      return [
        "All",
        ...Array.from(
          new Set(values)
        ),
      ];
    }, [publications]);

  // =====================================================
  // FILTER
  // =====================================================

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return publications.filter(
        (publication) => {
          if (
            field !== "All" &&
            publication.field !==
              field
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const searchableText =
            [
              publication.title,
              publication.researcher_name,
              publication.field,
              publication.abstract,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return searchableText.includes(
            query
          );
        }
      );
    }, [
      publications,
      search,
      field,
    ]);

  // =====================================================
  // STATS
  // =====================================================

  const totalPublications =
    publications.length;

  const totalResearchers =
    researchers.length;

  const totalFields =
    researchFields.length >
    0
      ? researchFields.length -
        1
      : 0;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="mx-auto max-w-[1100px] px-5 py-10 lg:px-10">
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <FlaskConical
            size={42}
            className="mx-auto animate-pulse text-primary/40"
          />

          <h1 className="mt-4 text-lg font-bold text-ink">
            Loading Research Portal
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Fetching publications and researchers from OSTA.
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
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <FlaskConical
                size={23}
              />
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
              OSTA Research Portal
            </span>
          </div>

          <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
            Explore research and knowledge from OSTA
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            Discover researchers and published academic work across
            technology, science, innovation, and related fields.
            Public visitors can explore research previews, while
            researcher accounts receive expanded access.
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
              loadResearch({
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
          ACCESS NOTICE
      ===================================================== */}

      <section className="mt-6 rounded-xl border border-primary/10 bg-primary-light p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={19}
            className="mt-0.5 shrink-0 text-primary"
          />

          <div>
            <h2 className="text-sm font-bold text-ink">
              Research access
            </h2>

            {isResearcher ? (
              <p className="mt-1 text-xs leading-5 text-slate-600">
                You are signed in with a researcher account. You
                have expanded access to publication details and
                researcher features.
              </p>
            ) : (
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Public visitors can discover publication previews.
                Full research access is reserved for researcher
                accounts.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* =================================================
          REAL STATS
      ================================================= */}

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <BookOpen
            size={20}
            className="text-primary"
          />

          <p className="mt-3 text-xs font-semibold text-slate-400">
            Publications
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink">
            {totalPublications}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <Users
            size={20}
            className="text-primary"
          />

          <p className="mt-3 text-xs font-semibold text-slate-400">
            Researchers
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink">
            {totalResearchers}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <FlaskConical
            size={20}
            className="text-primary"
          />

          <p className="mt-3 text-xs font-semibold text-slate-400">
            Research Fields
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink">
            {totalFields}
          </p>
        </div>
      </section>

      {/* =================================================
          SEARCH
      ================================================= */}

      <section className="mt-6">
        <ResearchSearchBar
          search={search}
          onSearchChange={
            setSearch
          }
          field={field}
          onFieldChange={
            setField
          }
          fields={
            researchFields
          }
        />
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* PUBLICATIONS */}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">
                Publications
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Research work available through OSTA.
              </p>
            </div>

            <span className="text-xs text-slate-400">
              {filtered.length} publication
              {filtered.length ===
              1
                ? ""
                : "s"}
            </span>
          </div>

          <div className="space-y-3">
            {filtered.map(
              (publication) => (
                <PublicationCard
                  key={
                    publication.id
                  }
                  publication={
                    publication
                  }
                  isAuthenticated={
                    isAuthenticated
                  }
                  isResearcher={
                    isResearcher
                  }
                />
              )
            )}

            {filtered.length ===
              0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
                <FileTextPlaceholder />

                <h3 className="mt-3 text-sm font-bold text-ink">
                  No publications found
                </h3>

                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                  Try another search term or select a different
                  research field.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* RESEARCHERS */}

        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-ink">
              Researchers
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Researchers participating in the OSTA ecosystem.
            </p>
          </div>

          <div className="space-y-3">
            {researchers.map(
              (researcher) => (
                <ResearcherProfileCard
                  key={
                    researcher.id
                  }
                  researcher={
                    researcher
                  }
                />
              )
            )}

            {researchers.length ===
              0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                <Users
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-semibold text-slate-500">
                  No researcher profiles yet
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Researcher profiles will appear here when they are
                  created.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function FileTextPlaceholder() {
  return (
    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
      <Search size={18} />
    </div>
  );
}