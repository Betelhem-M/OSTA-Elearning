import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  RefreshCw,
  Rocket,
  Send,
  Trophy,
  Users,
  X,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import InnovationIdeaCard from "@components/innovation/InnovationIdeaCard";
import StartupCard from "@components/innovation/StartupCard";
import HackathonCard from "@components/innovation/HackathonCard";

import {
  apiRequest,
} from "@services/api";

import {
  useAuth,
} from "@context/AuthContext";

const IDEA_CATEGORIES = [
  "Education",
  "Health",
  "Agriculture",
  "FinTech",
  "AI",
  "Environment",
  "Other",
];

const STARTUP_STAGES = [
  "Idea",
  "Prototype",
  "Early Stage",
  "Growth",
  "Established",
];

const PUBLIC_HACKATHON_STATUSES = [
  "published",
  "active",
  "upcoming",
  "completed",
];

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
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

function isInnovator(user) {
  return (
    user?.account_type ===
    "entrepreneur"
  );
}

export default function InnovationHub() {
  const {
    user,
    token,
    isAuthenticated,
  } = useAuth();

  const innovator =
    isInnovator(user);

  const [
    ideas,
    setIdeas,
  ] = useState([]);

  const [
    startups,
    setStartups,
  ] = useState([]);

  const [
    hackathons,
    setHackathons,
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
    success,
    setSuccess,
  ] = useState("");

  const [
    showIdeaForm,
    setShowIdeaForm,
  ] = useState(false);

  const [
    showStartupForm,
    setShowStartupForm,
  ] = useState(false);

  const [
    submittingIdea,
    setSubmittingIdea,
  ] = useState(false);

  const [
    submittingStartup,
    setSubmittingStartup,
  ] = useState(false);

  const [
    votingId,
    setVotingId,
  ] = useState(null);

  const [
    ideaForm,
    setIdeaForm,
  ] = useState({
    title: "",
    description: "",
    category:
      "Education",
  });

  const [
    startupForm,
    setStartupForm,
  ] = useState({
    name: "",
    description: "",
    category: "",
    stage: "Idea",
    website: "",
  });

  // =====================================================
  // LOAD PUBLIC CONTENT
  // =====================================================

  async function loadInnovationData({
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
        ideasResponse,
        startupsResponse,
        hackathonsResponse,
      ] = await Promise.all([
        apiRequest(
          "/innovation/ideas"
        ),
        apiRequest(
          "/innovation/startups"
        ),
        apiRequest(
          "/hackathons"
        ),
      ]);

      setIdeas(
        Array.isArray(
          ideasResponse
        )
          ? ideasResponse
          : []
      );

      setStartups(
        Array.isArray(
          startupsResponse
        )
          ? startupsResponse
          : []
      );

      setHackathons(
        Array.isArray(
          hackathonsResponse
        )
          ? hackathonsResponse.filter(
              (item) =>
                PUBLIC_HACKATHON_STATUSES.includes(
                  item.status
                )
            )
          : []
      );
    } catch (err) {
      console.error(
        "Innovation Hub load error:",
        err
      );

      setError(
        err.message ||
          "We couldn't load the Innovation Hub."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadInnovationData();
  }, []);

  // =====================================================
  // STATS
  // =====================================================

  const totalVotes =
    useMemo(
      () =>
        ideas.reduce(
          (
            total,
            idea
          ) =>
            total +
            Number(
              idea.votes ||
                0
            ),
          0
        ),
      [ideas]
    );

  const innovationStats = [
    {
      value:
        ideas.length,
      label:
        "Published ideas",
      icon:
        Lightbulb,
    },
    {
      value:
        totalVotes,
      label:
        "Community votes",
      icon:
        Users,
    },
    {
      value:
        startups.length,
      label:
        "Startups",
      icon:
        Rocket,
    },
    {
      value:
        hackathons.length,
      label:
        "Hackathons",
      icon:
        Trophy,
    },
  ];

  // =====================================================
  // SUBMIT IDEA
  // INNOVATOR ONLY
  // =====================================================

  async function handleSubmitIdea(
    event
  ) {
    event.preventDefault();

    if (!isAuthenticated) {
      setError(
        "Please log in as an innovator to submit an idea."
      );
      return;
    }

    if (!innovator) {
      setError(
        "Only innovator accounts can submit innovation ideas."
      );
      return;
    }

    const title =
      ideaForm.title.trim();

    const description =
      ideaForm.description.trim();

    if (
      !title ||
      !description
    ) {
      setError(
        "Idea title and description are required."
      );
      return;
    }

    try {
      setSubmittingIdea(
        true
      );
      setError("");
      setSuccess("");

      const response =
        await apiRequest(
          "/innovation/ideas",
          {
            token,
            method:
              "POST",
            body: {
              title,
              description,
              category:
                ideaForm.category,
            },
          }
        );

      setIdeaForm({
        title: "",
        description: "",
        category:
          "Education",
      });

      setShowIdeaForm(
        false
      );

      setSuccess(
        "Your idea was submitted for review. It will become publicly visible after publication."
      );

      await loadInnovationData({
        refresh: true,
      });

      console.log(
        "Created idea:",
        response?.idea
      );
    } catch (err) {
      console.error(
        "Submit idea error:",
        err
      );

      setError(
        err.message ||
          "Failed to submit innovation idea."
      );
    } finally {
      setSubmittingIdea(
        false
      );
    }
  }

  // =====================================================
  // VOTE
  // AUTHENTICATED USERS
  // =====================================================

  async function handleVote(
    ideaId
  ) {
    if (!isAuthenticated) {
      setError(
        "Please log in to vote for innovation ideas."
      );
      return;
    }

    try {
      setVotingId(
        ideaId
      );

      setError("");
      setSuccess("");

      await apiRequest(
        `/innovation/ideas/${ideaId}/vote`,
        {
          token,
          method:
            "POST",
        }
      );

      setIdeas(
        (previous) =>
          previous.map(
            (idea) =>
              Number(
                idea.id
              ) ===
              Number(
                ideaId
              )
                ? {
                    ...idea,
                    votes:
                      Number(
                        idea.votes ||
                          0
                      ) + 1,
                  }
                : idea
          )
      );

      setSuccess(
        "Your vote was recorded successfully."
      );
    } catch (err) {
      console.error(
        "Vote error:",
        err
      );

      setError(
        err.message ||
          "Failed to vote for this idea."
      );
    } finally {
      setVotingId(
        null
      );
    }
  }

  // =====================================================
  // SUBMIT STARTUP
  // INNOVATOR ONLY
  // =====================================================

  async function handleSubmitStartup(
    event
  ) {
    event.preventDefault();

    if (!isAuthenticated) {
      setError(
        "Please log in as an innovator to submit a startup."
      );
      return;
    }

    if (!innovator) {
      setError(
        "Only innovator accounts can submit startups."
      );
      return;
    }

    const name =
      startupForm.name.trim();

    if (!name) {
      setError(
        "Startup name is required."
      );
      return;
    }

    try {
      setSubmittingStartup(
        true
      );

      setError("");
      setSuccess("");

      await apiRequest(
        "/innovation/startups",
        {
          token,
          method:
            "POST",
          body: {
            name,
            description:
              startupForm.description.trim(),
            category:
              startupForm.category.trim(),
            stage:
              startupForm.stage,
            website:
              startupForm.website.trim(),
          },
        }
      );

      setStartupForm({
        name: "",
        description: "",
        category: "",
        stage: "Idea",
        website: "",
      });

      setShowStartupForm(
        false
      );

      setSuccess(
        "Your startup was submitted successfully."
      );

      await loadInnovationData({
        refresh: true,
      });
    } catch (err) {
      console.error(
        "Submit startup error:",
        err
      );

      setError(
        err.message ||
          "Failed to submit startup."
      );
    } finally {
      setSubmittingStartup(
        false
      );
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="mx-auto max-w-[1100px] px-5 py-10 lg:px-10">
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <Lightbulb
            size={42}
            className="mx-auto animate-pulse text-primary/40"
          />

          <h1 className="mt-4 text-lg font-bold text-ink">
            Loading Innovation Hub
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Discovering published ideas, startups, and hackathons.
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
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />

        <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <Lightbulb
                  size={23}
                />
              </div>

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
                OSTA Innovation Hub
              </span>
            </div>

            <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
              Discover ideas. Support innovation.
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Explore published ideas, discover startups, and keep
              up with hackathons. Become an innovator to submit
              your own ideas and startups.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadInnovationData({
                refresh:
                  true,
              })
            }
            disabled={
              refreshing
            }
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/15 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </section>

      {/* =================================================
          MESSAGES
      ================================================= */}

      {success && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-green-600"
          />

          <p className="text-sm font-semibold text-green-700">
            {success}
          </p>

          <button
            type="button"
            onClick={() =>
              setSuccess(
                ""
              )
            }
            className="ml-auto text-green-500 hover:text-green-700"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700">
              Innovation Hub
            </p>

            <p className="mt-1 text-xs leading-5 text-red-600">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="text-red-400"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {innovationStats.map(
          (stat) => {
            const Icon =
              stat.icon;

            return (
              <div
                key={
                  stat.label
                }
                className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Icon
                      size={19}
                    />
                  </span>

                  <p className="text-2xl font-extrabold text-primary">
                    {stat.value}
                  </p>
                </div>

                <p className="mt-3 text-xs font-semibold text-slate-500">
                  {stat.label}
                </p>
              </div>
            );
          }
        )}
      </section>

      {/* =================================================
          HACKATHONS
      ================================================= */}

      <section className="mt-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">
              Hackathons
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Published hackathon opportunities and announcements.
            </p>
          </div>
        </div>

        {hackathons.length ===
        0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <Trophy
              size={35}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-3 text-sm font-bold text-ink">
              No public hackathons yet
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
              Published hackathons will appear here for students,
              researchers, and innovators.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hackathons.map(
              (hackathon) => (
                <HackathonCard
                  key={
                    hackathon.id
                  }
                  hackathon={
                    hackathon
                  }
                />
              )
            )}
          </div>
        )}
      </section>

      {/* =================================================
          INNOVATION IDEAS
      ================================================= */}

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">
              Published Innovation Ideas
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Discover ideas that have been approved for public viewing.
            </p>
          </div>

          {!isAuthenticated ? (
            <span className="text-xs text-slate-400">
              Log in to vote
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              {user?.account_type ===
              "entrepreneur"
                ? "Innovator access"
                : "Community member access"}
            </span>
          )}
        </div>

        {ideas.length ===
        0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <Lightbulb
              size={35}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-3 text-sm font-bold text-ink">
              No published ideas yet
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
              When an innovator submits an idea and it is published,
              it will appear here for the community to discover.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {ideas.map(
              (idea) => (
                <div
                  key={
                    idea.id
                  }
                  className="relative"
                >
                  <InnovationIdeaCard
                    idea={idea}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleVote(
                        idea.id
                      )
                    }
                    disabled={
                      !isAuthenticated ||
                      votingId ===
                        idea.id
                    }
                    className="absolute bottom-4 right-4 rounded-lg bg-primary px-3 py-2 text-[11px] font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {!isAuthenticated
                      ? "Log in to vote"
                      : votingId ===
                          idea.id
                        ? "Voting..."
                        : `Vote · ${
                            Number(
                              idea.votes ||
                                0
                            )
                          }`}
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* =================================================
          INNOVATOR SUBMISSION
      ================================================= */}

      <section className="mt-8">
        {innovator ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* IDEA */}

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <Lightbulb
                    size={19}
                  />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-ink">
                    Submit an Innovation Idea
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Share a new idea for review and publication.
                  </p>
                </div>
              </div>

              {!showIdeaForm ? (
                <button
                  type="button"
                  onClick={() =>
                    setShowIdeaForm(
                      true
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white"
                >
                  <Send size={14} />
                  Start Submission
                </button>
              ) : (
                <form
                  onSubmit={
                    handleSubmitIdea
                  }
                  className="mt-5 space-y-4"
                >
                  <input
                    value={
                      ideaForm.title
                    }
                    onChange={(
                      event
                    ) =>
                      setIdeaForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          title:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Idea title"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                  />

                  <select
                    value={
                      ideaForm.category
                    }
                    onChange={(
                      event
                    ) =>
                      setIdeaForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          category:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary"
                  >
                    {IDEA_CATEGORIES.map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item
                          }
                          value={
                            item
                          }
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>

                  <textarea
                    value={
                      ideaForm.description
                    }
                    onChange={(
                      event
                    ) =>
                      setIdeaForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          description:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Describe the problem, proposed solution, and impact..."
                    className="min-h-[140px] w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-primary"
                  />

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={
                        submittingIdea
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      <Send
                        size={
                          14
                        }
                      />

                      {submittingIdea
                        ? "Submitting..."
                        : "Submit Idea"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowIdeaForm(
                          false
                        )
                      }
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* STARTUP */}

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <Rocket
                    size={19}
                  />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-ink">
                    Submit a Startup
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Introduce your startup to the OSTA ecosystem.
                  </p>
                </div>
              </div>

              {!showStartupForm ? (
                <button
                  type="button"
                  onClick={() =>
                    setShowStartupForm(
                      true
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white"
                >
                  <Rocket
                    size={14}
                  />
                  Start Submission
                </button>
              ) : (
                <form
                  onSubmit={
                    handleSubmitStartup
                  }
                  className="mt-5 space-y-4"
                >
                  <input
                    value={
                      startupForm.name
                    }
                    onChange={(
                      event
                    ) =>
                      setStartupForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          name:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Startup name"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                  />

                  <input
                    value={
                      startupForm.category
                    }
                    onChange={(
                      event
                    ) =>
                      setStartupForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          category:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Category"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                  />

                  <select
                    value={
                      startupForm.stage
                    }
                    onChange={(
                      event
                    ) =>
                      setStartupForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          stage:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary"
                  >
                    {STARTUP_STAGES.map(
                      (
                        stage
                      ) => (
                        <option
                          key={
                            stage
                          }
                          value={
                            stage
                          }
                        >
                          {stage}
                        </option>
                      )
                    )}
                  </select>

                  <input
                    value={
                      startupForm.website
                    }
                    onChange={(
                      event
                    ) =>
                      setStartupForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          website:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Website (optional)"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                  />

                  <textarea
                    value={
                      startupForm.description
                    }
                    onChange={(
                      event
                    ) =>
                      setStartupForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          description:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Describe your startup..."
                    className="min-h-[120px] w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-primary"
                  />

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={
                        submittingStartup
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      <Send
                        size={
                          14
                        }
                      />

                      {submittingStartup
                        ? "Submitting..."
                        : "Submit Startup"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowStartupForm(
                          false
                        )
                      }
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-surface p-7 text-center">
            <Rocket
              size={30}
              className="mx-auto text-primary"
            />

            <h2 className="mt-3 text-base font-bold text-ink">
              Want to publish your own innovation?
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              OSTA separates public discovery from creator access.
              Become an innovator account to submit ideas and startups
              to the platform.
            </p>

            {!isAuthenticated ? (
              <Link
                to="/register"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-white"
              >
                Create an Account
                <ArrowRight
                  size={14}
                />
              </Link>
            ) : (
              <p className="mt-4 text-xs font-semibold text-slate-400">
                Your current account does not have innovator submission
                privileges.
              </p>
            )}
          </div>
        )}
      </section>

      {/* =================================================
          STARTUPS
      ================================================= */}

      <section className="mt-8">
        <div>
          <h2 className="text-lg font-bold text-ink">
            Startups from OSTA
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Explore startups already submitted to the OSTA ecosystem.
          </p>
        </div>

        {startups.length ===
        0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <Rocket
              size={35}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-3 text-sm font-bold text-ink">
              No startups have been published yet
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
              Published startup profiles will appear here for the
              OSTA community to discover.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {startups.map(
              (startup) => (
                <div
                  key={
                    startup.id
                  }
                  className="relative"
                >
                  <StartupCard
                    startup={
                      startup
                    }
                  />

                  {startup.website && (
                    <a
                      href={
                        startup.website
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-primary hover:border-primary"
                    >
                      Visit
                      <ExternalLink
                        size={
                          12
                        }
                      />
                    </a>
                  )}

                  {startup.created_at && (
                    <p className="px-4 pb-3 text-[10px] text-slate-400">
                      Added{" "}
                      {formatDate(
                        startup.created_at
                      )}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}