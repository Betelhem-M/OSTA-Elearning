import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Trophy,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  X,
  Check,
  Clock,
  Users,
  FileText,
  Medal,
  BarChart3,
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Activity,
  Target,
  Award,
  Zap,
  ExternalLink,
  ShieldCheck,
  CircleDot,
} from "lucide-react";

import api from "../../services/api";

/* ============================================================
   CONFIGURATION
============================================================ */

const PAGE_SIZE = 8;

const STATUS_OPTIONS = [
  "all",
  "draft",
  "published",
  "active",
  "completed",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "",
  start_date: "",
  deadline: "",
  prize: "",
  status: "draft",
};

/*
 * Backend endpoints
 *
 * Existing:
 * GET    /competitions
 * GET    /competitions/:id
 * POST   /competitions
 * PUT    /competitions/:id
 * DELETE /competitions/:id
 * GET    /competitions/:id/participants
 * GET    /competitions/:id/submissions
 * GET    /competitions/:id/leaderboard
 *
 * Not yet implemented on the backend:
 * PATCH  /competitions/:id/lifecycle
 * (status changes currently go through PUT /competitions/:id)
 */

const ENDPOINTS = {
  competitions: "/competitions",

  // GET /competitions is public and excludes drafts.
  // The admin table needs drafts too, so it uses /competitions/admin.
  adminList: "/competitions/admin",

  participants: (id) =>
    `/competitions/${id}/participants`,

  submissions: (id) =>
    `/competitions/${id}/submissions`,

  leaderboard: (id) =>
    `/competitions/${id}/leaderboard`,

  lifecycle: (id) =>
    `/competitions/${id}/lifecycle`,
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function AdminCompetitions() {
  /* ----------------------------------------------------------
     DATA
  ---------------------------------------------------------- */

  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ----------------------------------------------------------
     SEARCH / FILTER
  ---------------------------------------------------------- */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  /* ----------------------------------------------------------
     CREATE / EDIT
  ---------------------------------------------------------- */

  const [showForm, setShowForm] = useState(false);
  const [editingCompetition, setEditingCompetition] =
    useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  /* ----------------------------------------------------------
     DETAILS
  ---------------------------------------------------------- */

  const [selectedCompetition, setSelectedCompetition] =
    useState(null);

  const [detailsTab, setDetailsTab] = useState("overview");

  /* ----------------------------------------------------------
     DETAILS DATA
  ---------------------------------------------------------- */

  const [participants, setParticipants] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  /* ----------------------------------------------------------
     DELETE
  ---------------------------------------------------------- */

  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ==========================================================
     FETCH COMPETITIONS
  ========================================================== */

  const fetchCompetitions = async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get(
        ENDPOINTS.adminList
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.competitions || [];

      setCompetitions(data);
    } catch (err) {
      console.error(
        "Fetch competitions error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load competitions."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  /* ==========================================================
     SEARCH / FILTER HANDLERS
  ========================================================== */

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(1);
  };

  /* ==========================================================
     CATEGORIES
  ========================================================== */

  const categories = useMemo(() => {
    const values = competitions
      .map((item) => item.category)
      .filter(Boolean);

    return [
      "all",
      ...new Set(values),
    ];
  }, [competitions]);

  /* ==========================================================
     FILTERED COMPETITIONS
  ========================================================== */

  const filteredCompetitions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return competitions.filter((competition) => {
      const title =
        competition.title?.toLowerCase() || "";

      const description =
        competition.description?.toLowerCase() || "";

      const category =
        competition.category?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        title.includes(query) ||
        description.includes(query) ||
        category.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        competition.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        competition.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    competitions,
    search,
    statusFilter,
    categoryFilter,
  ]);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCompetitions.length / PAGE_SIZE
    )
  );

  const currentPage = Math.min(
    Math.max(page, 1),
    totalPages
  );

  const paginatedCompetitions =
    filteredCompetitions.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE
    );

  /* ==========================================================
     ANALYTICS
  ========================================================== */

  const analytics = useMemo(() => {
    const total = competitions.length;

    const published = competitions.filter(
      (item) => item.status === "published"
    ).length;

    const active = competitions.filter(
      (item) => item.status === "active"
    ).length;

    const upcoming = competitions.filter(
      (item) =>
        getLifecycle(item) === "upcoming"
    ).length;

    const completed = competitions.filter(
      (item) => item.status === "completed"
    ).length;

    const draft = competitions.filter(
      (item) => item.status === "draft"
    ).length;

    const participants = competitions.reduce(
      (sum, competition) =>
        sum +
        Number(
          competition.team_count ??
            competition.participant_count ??
            0
        ),
      0
    );

    const totalSubmissions = competitions.reduce(
      (sum, competition) =>
        sum +
        Number(
          competition.submission_count ?? 0
        ),
      0
    );

    return {
      total,
      published,
      active,
      upcoming,
      completed,
      draft,
      participants,
      totalSubmissions,
    };
  }, [competitions]);

  /* ==========================================================
     STATUS DISTRIBUTION
  ========================================================== */

  const statusDistribution = useMemo(() => {
    const total = competitions.length || 1;

    const values = [
      {
        label: "Draft",
        value: analytics.draft,
        color: "bg-amber-500",
      },
      {
        label: "Upcoming",
        value: analytics.upcoming,
        color: "bg-violet-500",
      },
      {
        label: "Published",
        value: analytics.published,
        color: "bg-emerald-500",
      },
      {
        label: "Active",
        value: analytics.active,
        color: "bg-blue-500",
      },
      {
        label: "Completed",
        value: analytics.completed,
        color: "bg-gray-500",
      },
    ];

    return values.map((item) => ({
      ...item,
      percentage: Math.round(
        (item.value / total) * 100
      ),
    }));
  }, [competitions.length, analytics]);

  /* ==========================================================
     FORM
  ========================================================== */

  const openCreate = () => {
    setEditingCompetition(null);

    setForm({
      ...EMPTY_FORM,
    });

    setError("");
    setShowForm(true);
  };

  const openEdit = (competition) => {
    setEditingCompetition(competition);

    setForm({
      title: competition.title || "",

      description:
        competition.description || "",

      category:
        competition.category || "",

      start_date: toDateTimeInput(
        competition.start_date
      ),

      deadline: toDateTimeInput(
        competition.deadline
      ),

      prize: competition.prize || "",

      status:
        competition.status || "draft",
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingCompetition(null);

    setForm({
      ...EMPTY_FORM,
    });
  };

  const handleFormChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* ==========================================================
     CREATE / UPDATE
  ========================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError(
        "Competition title is required."
      );
      return;
    }

    if (!form.deadline) {
      setError(
        "Competition deadline is required."
      );
      return;
    }

    if (
      form.start_date &&
      new Date(form.start_date) >=
        new Date(form.deadline)
    ) {
      setError(
        "Start date must be before the deadline."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),

        description:
          form.description.trim() || null,

        category:
          form.category.trim() || null,

        start_date:
          form.start_date || null,

        deadline: form.deadline,

        prize:
          form.prize.trim() || null,

        status: form.status,
      };

      if (editingCompetition) {
        await api.put(
          `${ENDPOINTS.competitions}/${editingCompetition.id}`,
          payload
        );
      } else {
        await api.post(
          ENDPOINTS.competitions,
          payload
        );
      }

      await fetchCompetitions(false);

      closeForm();
    } catch (err) {
      console.error(
        "Save competition error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save competition."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     OPEN DETAILS
  ========================================================== */

  const openDetails = async (competition) => {
    setSelectedCompetition(competition);
    setDetailsTab("overview");

    setDetailsError("");
    setParticipants([]);
    setSubmissions([]);
    setLeaderboard([]);

    await loadDetailsData(
      competition.id,
      "overview"
    );
  };

  const closeDetails = () => {
    setSelectedCompetition(null);

    setParticipants([]);
    setSubmissions([]);
    setLeaderboard([]);
    setDetailsError("");
  };

  /* ==========================================================
     DETAILS DATA
  ========================================================== */

  const loadDetailsData = async (
    competitionId,
    tab
  ) => {
    if (tab === "overview") {
      return;
    }

    try {
      setDetailsLoading(true);
      setDetailsError("");

      if (tab === "participants") {
        const response = await api.get(
          ENDPOINTS.participants(
            competitionId
          )
        );

        setParticipants(
          Array.isArray(response.data)
            ? response.data
            : response.data?.participants ||
                []
        );
      }

      if (tab === "submissions") {
        const response = await api.get(
          ENDPOINTS.submissions(
            competitionId
          )
        );

        setSubmissions(
          Array.isArray(response.data)
            ? response.data
            : response.data?.submissions ||
                []
        );
      }

      if (tab === "leaderboard") {
        const response = await api.get(
          ENDPOINTS.leaderboard(
            competitionId
          )
        );

        setLeaderboard(
          Array.isArray(response.data)
            ? response.data
            : response.data?.leaderboard ||
                []
        );
      }
    } catch (err) {
      console.error(
        "Load competition details error:",
        err
      );

      if (err.response?.status === 404) {
        setDetailsError(
          "This management endpoint is not available yet in the backend."
        );
      } else {
        setDetailsError(
          err.response?.data?.message ||
            "Failed to load data."
        );
      }
    } finally {
      setDetailsLoading(false);
    }
  };

  const changeDetailsTab = (tab) => {
    setDetailsTab(tab);

    if (!selectedCompetition) {
      return;
    }

    loadDetailsData(
      selectedCompetition.id,
      tab
    );
  };

  /* ==========================================================
     STATUS / LIFECYCLE
  ========================================================== */

  const updateCompetitionStatus = async (
    competition,
    newStatus
  ) => {
    try {
      setSaving(true);
      setError("");

      /*
       * This uses the existing PUT endpoint
       * because that endpoint is already available.
       *
       * If your backend supports:
       *
       * PATCH /competitions/:id/lifecycle
       *
       * you can replace this request with:
       *
       * await api.patch(
       *   ENDPOINTS.lifecycle(competition.id),
       *   { status: newStatus }
       * );
       */

      await api.put(
        `${ENDPOINTS.competitions}/${competition.id}`,
        {
          title: competition.title,

          description:
            competition.description || null,

          category:
            competition.category || null,

          start_date:
            competition.start_date || null,

          deadline:
            competition.deadline,

          prize:
            competition.prize || null,

          status: newStatus,
        }
      );

      setCompetitions((current) =>
        current.map((item) =>
          item.id === competition.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

      if (
        selectedCompetition?.id ===
        competition.id
      ) {
        setSelectedCompetition(
          (current) => ({
            ...current,
            status: newStatus,
          })
        );
      }
    } catch (err) {
      console.error(
        "Lifecycle error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update competition status."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     DELETE
  ========================================================== */

  const deleteCompetition = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.delete(
        `${ENDPOINTS.competitions}/${deleteTarget.id}`
      );

      setCompetitions((current) =>
        current.filter(
          (item) =>
            item.id !== deleteTarget.id
        )
      );

      if (
        selectedCompetition?.id ===
        deleteTarget.id
      ) {
        closeDetails();
      }

      setDeleteTarget(null);
    } catch (err) {
      console.error(
        "Delete competition error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete competition."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     STATUS HELPERS
  ========================================================== */

  const statusClass = (status) => {
    const map = {
      draft:
        "bg-amber-50 text-amber-700 border-amber-200",

      published:
        "bg-emerald-50 text-emerald-700 border-emerald-200",

      upcoming:
        "bg-violet-50 text-violet-700 border-violet-200",

      active:
        "bg-blue-50 text-blue-700 border-blue-200",

      completed:
        "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
      map[status] || map.draft
    );
  };

  const statusLabel = (status) => {
    if (!status) {
      return "Draft";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-full space-y-6 bg-gray-50/60 p-4 md:p-6">

      {/* =====================================================
          HERO
      ===================================================== */}

      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 animate-pulse rounded-full bg-primary-100/70 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-56 w-56 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-200">
              <Trophy size={28} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">

                <h1 className="text-2xl font-black tracking-tight text-gray-900">
                  Competition Command Center
                </h1>

                <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-600">
                  Admin
                </span>

              </div>

              <p className="mt-1 text-sm text-gray-500">
                Manage competitions, participants,
                submissions, rankings and lifecycle.
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                fetchCompetitions(false)
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg"
            >
              <Plus size={18} />

              New Competition
            </button>

          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <Alert
          message={error}
          onClose={() => setError("")}
        />
      )}

      {/* =====================================================
          ANALYTICS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">

        <MetricCard
          label="Total"
          value={analytics.total}
          icon={<Trophy size={19} />}
          color="primary"
        />

        <MetricCard
          label="Published"
          value={analytics.published}
          icon={<ShieldCheck size={19} />}
          color="emerald"
        />

        <MetricCard
          label="Upcoming"
          value={analytics.upcoming}
          icon={<CalendarDays size={19} />}
          color="violet"
        />

        <MetricCard
          label="Active"
          value={analytics.active}
          icon={<Activity size={19} />}
          color="blue"
        />

        <MetricCard
          label="Completed"
          value={analytics.completed}
          icon={<Award size={19} />}
          color="orange"
        />

        <MetricCard
          label="Participants"
          value={analytics.participants}
          icon={<Users size={19} />}
          color="pink"
        />

      </div>

      {/* =====================================================
          ACTIVITY / STATUS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="font-bold text-gray-900">
                Competition Activity
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Current competition lifecycle distribution
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Activity size={18} />
            </div>

          </div>

          <div className="space-y-4">

            {statusDistribution.map(
              (item) => (
                <div key={item.label}>

                  <div className="mb-1.5 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <span
                        className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                      />

                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>

                    </div>

                    <span className="text-xs font-bold text-gray-500">
                      {item.value} ·{" "}
                      {item.percentage}%
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />

                  </div>
                </div>
              )
            )}

          </div>
        </div>

        {/* PLATFORM PULSE */}

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-600 to-primary-800 p-6 text-white shadow-lg">

          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary-100">
                  Platform Pulse
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  {analytics.active}
                </h2>

                <p className="mt-1 text-sm text-primary-100">
                  active competitions
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Zap size={23} />
              </div>

            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">

              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-xs text-primary-100">
                  Participants
                </p>

                <p className="mt-1 text-xl font-black">
                  {analytics.participants}
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-xs text-primary-100">
                  Submissions
                </p>

                <p className="mt-1 text-xl font-black">
                  {analytics.totalSubmissions}
                </p>
              </div>

            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/10 p-3">
              <div className="flex items-center gap-2 text-xs text-primary-100">
                <Target size={14} />
                Competition monitoring
              </div>

              <p className="mt-1 text-sm font-semibold">
                Everything is being tracked from one place.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          SEARCH / FILTER
      ===================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="mb-4 flex flex-col gap-1">
          <h2 className="font-bold text-gray-900">
            Competition Directory
          </h2>

          <p className="text-xs text-gray-500">
            Search and manage all competitions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">

          <div className="relative md:col-span-2">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search competitions..."
              className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
            />

          </div>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
          >
            {STATUS_OPTIONS.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === "all"
                    ? "All Statuses"
                    : statusLabel(status)}
                </option>
              )
            )}
          </select>

          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
          >
            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category === "all"
                    ? "All Categories"
                    : category}
                </option>
              )
            )}
          </select>

        </div>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {loading ? (
          <LoadingState />
        ) : paginatedCompetitions.length === 0 ? (
          <EmptyState onCreate={openCreate} />
        ) : (
          <>
            <div className="overflow-x-auto">

              <table className="min-w-[1050px] w-full">

                <thead className="border-b border-gray-200 bg-gray-50">

                  <tr>

                    <TableHead>
                      Competition
                    </TableHead>

                    <TableHead>
                      Category
                    </TableHead>

                    <TableHead>
                      Schedule
                    </TableHead>

                    <TableHead>
                      Participants
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead align="right">
                      Actions
                    </TableHead>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {paginatedCompetitions.map(
                    (competition) => (
                      <tr
                        key={competition.id}
                        className="group transition-colors duration-200 hover:bg-primary-50/30"
                      >

                        <td className="sticky left-0 z-[1] bg-white px-6 py-4 group-hover:bg-primary-50/30">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 transition-transform duration-200 group-hover:scale-110">
                              <Trophy size={18} />
                            </div>

                            <div className="min-w-0">

                              <p className="max-w-xs truncate font-semibold text-gray-900">
                                {competition.title}
                              </p>

                              <p className="mt-0.5 max-w-xs truncate text-xs text-gray-500">
                                {competition.description ||
                                  "No description"}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {competition.category ||
                            "—"}
                        </td>

                        <td className="px-6 py-4">

                          <div className="text-xs text-gray-500">
                            <span className="font-medium text-gray-700">
                              Start:
                            </span>{" "}
                            {formatDate(
                              competition.start_date
                            )}
                          </div>

                          <div className="mt-1 text-xs text-gray-500">
                            <span className="font-medium text-gray-700">
                              End:
                            </span>{" "}
                            {formatDate(
                              competition.deadline
                            )}
                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">

                            <Users
                              size={16}
                              className="text-gray-400"
                            />

                            {competition.team_count ??
                              competition.participant_count ??
                              0}

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <StatusBadge
                            status={
                              getLifecycle(
                                competition
                              )
                            }
                            statusClass={
                              statusClass
                            }
                            statusLabel={
                              statusLabel
                            }
                          />

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex justify-end gap-1">

                            <IconButton
                              title="View competition"
                              onClick={() =>
                                openDetails(
                                  competition
                                )
                              }
                            >
                              <Eye size={17} />
                            </IconButton>

                            <IconButton
                              title="Edit competition"
                              onClick={() =>
                                openEdit(
                                  competition
                                )
                              }
                            >
                              <Pencil size={17} />
                            </IconButton>

                            {competition.status ===
                              "draft" && (
                              <IconButton
                                title="Publish competition"
                                color="green"
                                onClick={() =>
                                  updateCompetitionStatus(
                                    competition,
                                    "published"
                                  )
                                }
                              >
                                <Check size={17} />
                              </IconButton>
                            )}

                            {competition.status ===
                              "published" && (
                              <IconButton
                                title="Activate competition"
                                color="blue"
                                onClick={() =>
                                  updateCompetitionStatus(
                                    competition,
                                    "active"
                                  )
                                }
                              >
                                <Zap size={17} />
                              </IconButton>
                            )}

                            {competition.status ===
                              "active" && (
                              <IconButton
                                title="Complete competition"
                                color="orange"
                                onClick={() =>
                                  updateCompetitionStatus(
                                    competition,
                                    "completed"
                                  )
                                }
                              >
                                <Award size={17} />
                              </IconButton>
                            )}

                            <IconButton
                              title="Delete competition"
                              color="red"
                              onClick={() =>
                                setDeleteTarget(
                                  competition
                                )
                              }
                            >
                              <Trash2 size={17} />
                            </IconButton>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* PAGINATION */}

            <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm text-gray-500">
                Showing{" "}
                {filteredCompetitions.length ===
                0
                  ? 0
                  : (currentPage - 1) *
                      PAGE_SIZE +
                    1}{" "}
                to{" "}
                {Math.min(
                  currentPage * PAGE_SIZE,
                  filteredCompetitions.length
                )}{" "}
                of{" "}
                {filteredCompetitions.length}
              </p>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setPage((value) =>
                      Math.max(
                        1,
                        value - 1
                      )
                    )
                  }
                  className="rounded-xl border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                </button>

                <span className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                  {currentPage} /{" "}
                  {totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    setPage((value) =>
                      Math.min(
                        totalPages,
                        value + 1
                      )
                    )
                  }
                  className="rounded-xl border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={17} />
                </button>

              </div>
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showForm && (
        <Modal
          title={
            editingCompetition
              ? "Edit Competition"
              : "Create Competition"
          }
          onClose={closeForm}
          wide
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              <FormInput
                label="Competition Title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                required
                placeholder="e.g. OSTA Innovation Challenge"
              />

              <FormInput
                label="Category"
                name="category"
                value={form.category}
                onChange={handleFormChange}
                placeholder="Technology"
              />

              <DateInput
                label="Start Date"
                name="start_date"
                value={form.start_date}
                onChange={handleFormChange}
              />

              <DateInput
                label="Deadline"
                name="deadline"
                value={form.deadline}
                onChange={handleFormChange}
                required
              />

              <FormInput
                label="Prize"
                name="prize"
                value={form.prize}
                onChange={handleFormChange}
                placeholder="10,000 ETB"
              />

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  {STATUS_OPTIONS
                    .filter(
                      (status) =>
                        status !== "all"
                    )
                    .map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {statusLabel(
                          status
                        )}
                      </option>
                    ))}
                </select>
              </div>

            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={5}
                placeholder="Describe the competition, rules and objectives..."
                className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                )}

                {editingCompetition
                  ? "Save Changes"
                  : "Create Competition"}
              </button>

            </div>

          </form>
        </Modal>
      )}

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedCompetition && (
        <Modal
          title="Competition Command Center"
          onClose={closeDetails}
          wide
        >

          {/* HEADER */}

          <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md">
                  <Trophy size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    {selectedCompetition.title}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {selectedCompetition.category ||
                      "General Competition"}
                  </p>
                </div>

              </div>

              <StatusBadge
                status={getLifecycle(
                  selectedCompetition
                )}
                statusClass={statusClass}
                statusLabel={statusLabel}
              />

            </div>

            {/* QUICK METRICS */}

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">

              <QuickMetric
                label="Participants"
                value={
                  selectedCompetition.team_count ??
                  selectedCompetition.participant_count ??
                  participants.length
                }
                icon={<Users size={17} />}
              />

              <QuickMetric
                label="Submissions"
                value={
                  submissions.length ||
                  selectedCompetition.submission_count ||
                  "—"
                }
                icon={<FileText size={17} />}
              />

              <QuickMetric
                label="Deadline"
                value={formatShortDate(
                  selectedCompetition.deadline
                )}
                icon={<Clock size={17} />}
              />

              <QuickMetric
                label="Prize"
                value={
                  selectedCompetition.prize ||
                  "—"
                }
                icon={<Award size={17} />}
              />

            </div>
          </div>

          {/* TABS */}

          <div className="mb-6 flex overflow-x-auto border-b border-gray-200">

            {[
              [
                "overview",
                "Overview",
                BarChart3,
              ],
              [
                "participants",
                "Participants",
                Users,
              ],
              [
                "submissions",
                "Submissions",
                FileText,
              ],
              [
                "leaderboard",
                "Leaderboard",
                Medal,
              ],
            ].map(
              ([tab, label, Icon]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() =>
                    changeDetailsTab(
                      tab
                    )
                  }
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                    detailsTab === tab
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Icon size={17} />
                  {label}
                </button>
              )
            )}

          </div>

          {/* CONTENT */}

          {detailsLoading ? (
            <div className="flex min-h-[260px] items-center justify-center">

              <div className="flex flex-col items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
                  <RefreshCw
                    size={24}
                    className="animate-spin text-primary-600"
                  />
                </div>

                <p className="text-sm text-gray-500">
                  Loading competition data...
                </p>

              </div>

            </div>
          ) : detailsError ? (
            <Alert message={detailsError} />
          ) : (
            <>
              {detailsTab === "overview" && (
                <OverviewTab
                  competition={
                    selectedCompetition
                  }
                  onStatusChange={
                    updateCompetitionStatus
                  }
                  saving={saving}
                />
              )}

              {detailsTab ===
                "participants" && (
                <ParticipantsTab
                  participants={
                    participants
                  }
                  competitionId={
                    selectedCompetition.id
                  }
                  onScoreUpdated={() =>
                    loadDetailsData(
                      selectedCompetition.id,
                      "participants"
                    )
                  }
                />
              )}

              {detailsTab ===
                "submissions" && (
                <SubmissionsTab
                  submissions={
                    submissions
                  }
                />
              )}

              {detailsTab ===
                "leaderboard" && (
                <LeaderboardTab
                  leaderboard={
                    leaderboard
                  }
                />
              )}
            </>
          )}

        </Modal>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteTarget && (
        <Modal
          title="Delete Competition"
          onClose={() =>
            !saving &&
            setDeleteTarget(null)
          }
        >

          <div className="space-y-5">

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

              <div className="flex gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <AlertCircle size={22} />
                </div>

                <div>

                  <h3 className="font-bold text-red-900">
                    Permanent deletion
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    You are about to delete{" "}
                    <strong>
                      {deleteTarget.title}
                    </strong>
                    . This action cannot
                    be undone.
                  </p>

                </div>

              </div>
            </div>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={saving}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteCompetition}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                )}

                Delete Permanently
              </button>

            </div>

          </div>

        </Modal>
      )}

    </div>
  );
}

/* ============================================================
   OVERVIEW TAB
============================================================ */

function OverviewTab({
  competition,
  onStatusChange,
  saving,
}) {
  const lifecycle = getLifecycle(competition);

  // Safely get the lifecycle/status value.
  // Supports both:
  //   getLifecycle() -> "active"
  // and:
  //   getLifecycle() -> { status: "active" }
  const lifecycleStatus =
    typeof lifecycle === "string"
      ? lifecycle
      : lifecycle?.status || competition?.status || "draft";

  // Convert internal status values into user-friendly labels.
  const getStatusLabel = (status) => {
    const labels = {
      draft: "Draft",
      published: "Published",
      upcoming: "Upcoming",
      active: "Active",
      completed: "Completed",
    };

    return (
      labels[status] ||
      String(status || "Unknown")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    );
  };

  return (
    <div className="space-y-6">

      {/* ======================================================
          OVERVIEW + SCHEDULE
      ====================================================== */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* DESCRIPTION */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5">

          <div className="mb-4 flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Target size={19} />
            </div>

            <h3 className="font-bold text-gray-900">
              Competition Overview
            </h3>

          </div>

          <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
            {competition?.description ||
              "No description provided."}
          </p>

        </div>

        {/* SCHEDULE */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5">

          <div className="mb-4 flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <CalendarDays size={19} />
            </div>

            <h3 className="font-bold text-gray-900">
              Schedule
            </h3>

          </div>

          <div className="space-y-4">

            <ScheduleItem
              label="Start"
              value={formatDateTime(
                competition?.start_date
              )}
            />

            <ScheduleItem
              label="Deadline"
              value={formatDateTime(
                competition?.deadline
              )}
            />

            <ScheduleItem
              label="Current lifecycle"
              value={getStatusLabel(
                lifecycleStatus
              )}
            />

          </div>
        </div>
      </div>

      {/* ======================================================
          LIFECYCLE
      ====================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-5">

        <div className="mb-5 flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <Activity size={19} />
          </div>

          <div>
            <h3 className="font-bold text-gray-900">
              Competition Lifecycle
            </h3>

            <p className="text-xs text-gray-500">
              Track the competition from creation to completion.
            </p>
          </div>

        </div>

        {/* LIFECYCLE STEPS */}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">

          {[
            "draft",
            "published",
            "upcoming",
            "active",
            "completed",
          ].map((status) => {

            const active =
              lifecycleStatus === status;

            return (
              <div
                key={status}
                className={`rounded-xl border p-4 transition ${
                  active
                    ? "border-primary-300 bg-primary-50 shadow-sm"
                    : "border-gray-200 bg-gray-50"
                }`}
              >

                <div className="flex items-center gap-2">

                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      active
                        ? "bg-indigo-600"
                        : "bg-gray-300"
                    }`}
                  />

                  <span
                    className={`text-sm font-bold ${
                      active
                        ? "text-primary-700"
                        : "text-gray-600"
                    }`}
                  >
                    {getStatusLabel(status)}
                  </span>

                </div>

              </div>
            );
          })}

        </div>

        {/* ====================================================
            LIFECYCLE ACTIONS
        ==================================================== */}

        <div className="mt-5 flex flex-wrap gap-2">

          {competition?.status === "draft" && (
            <LifecycleButton
              label="Publish Competition"
              onClick={() =>
                onStatusChange(
                  competition,
                  "published"
                )
              }
              disabled={saving}
            />
          )}

          {competition?.status === "published" && (
            <LifecycleButton
              label="Activate Competition"
              onClick={() =>
                onStatusChange(
                  competition,
                  "active"
                )
              }
              disabled={saving}
            />
          )}

          {competition?.status === "active" && (
            <LifecycleButton
              label="Complete Competition"
              onClick={() =>
                onStatusChange(
                  competition,
                  "completed"
                )
              }
              disabled={saving}
            />
          )}

        </div>
      </div>
    </div>
  );
}








/* ============================================================
   PARTICIPANTS
============================================================ */

function ParticipantsTab({
  participants,
  competitionId,
  onScoreUpdated,
}) {
  const [scoreDrafts, setScoreDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [scoreError, setScoreError] = useState("");

  if (!participants.length) {
    return (
      <EmptyInner
        icon={<Users size={28} />}
        title="No participants"
        text="Participants who join this competition will appear here."
      />
    );
  }

  const getDraftValue = (participant) =>
    scoreDrafts[participant.id] ??
    (participant.score ?? "");

  const handleScoreChange = (participantId, value) => {
    setScoreDrafts((current) => ({
      ...current,
      [participantId]: value,
    }));
  };

  const handleSaveScore = async (participant) => {
    const draft = getDraftValue(participant);
    const numericScore = Number(draft);

    if (draft === "" || Number.isNaN(numericScore)) {
      setScoreError("Enter a valid number before saving.");
      return;
    }

    try {
      setSavingId(participant.id);
      setScoreError("");

      await api.patch(
        `/competitions/${competitionId}/participants/${participant.id}/score`,
        { score: numericScore }
      );

      if (onScoreUpdated) {
        await onScoreUpdated();
      }
    } catch (err) {
      console.error("Update score error:", err);

      setScoreError(
        err.response?.data?.message ||
          "Failed to update score."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-3">

      {scoreError && (
        <Alert
          message={scoreError}
          onClose={() => setScoreError("")}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200">

      <div className="overflow-x-auto">

        <table className="min-w-[800px] w-full">

          <thead className="bg-gray-50">

            <tr>

              <TableHead>
                Student
              </TableHead>

              <TableHead>
                Team
              </TableHead>

              <TableHead>
                Joined
              </TableHead>

              <TableHead>
                Score
              </TableHead>

              <TableHead>
                Status
              </TableHead>

            </tr>

          </thead>

          <tbody className="divide-y divide-gray-100">

            {participants.map(
              (participant) => (
                <tr
                  key={participant.id}
                  className="transition hover:bg-gray-50"
                >

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600">
                        {getInitials(
                          participant.name ||
                            participant.first_name ||
                            "S"
                        )}
                      </div>

                      <div>

                        <p className="text-sm font-semibold text-gray-900">
                          {participant.name ||
                            `${participant.first_name || ""} ${participant.last_name || ""}`.trim() ||
                            "Student"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {participant.email ||
                            "Student"}
                        </p>

                      </div>

                    </div>

                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {participant.team_name ||
                      participant.team ||
                      "Individual"}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {formatDate(
                      participant.joined_at
                    )}
                  </td>

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2">

                      <input
                        type="number"
                        step="0.01"
                        value={getDraftValue(participant)}
                        onChange={(event) =>
                          handleScoreChange(
                            participant.id,
                            event.target.value
                          )
                        }
                        placeholder="—"
                        className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleSaveScore(participant)
                        }
                        disabled={savingId === participant.id}
                        className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingId === participant.id
                          ? "Saving..."
                          : "Save"}
                      </button>

                    </div>

                  </td>

                  <td className="px-5 py-4">

                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Active
                    </span>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>
    </div>
    </div>
  );
}

/* ============================================================
   SUBMISSIONS
============================================================ */

function SubmissionsTab({
  submissions,
}) {
  if (!submissions.length) {
    return (
      <EmptyInner
        icon={<FileText size={28} />}
        title="No submissions"
        text="Student project submissions will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">

      {submissions.map(
        (submission) => (
          <div
            key={submission.id}
            className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-primary-200 hover:shadow-sm md:flex-row md:items-center md:justify-between"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <FileText size={19} />
              </div>

              <div>

                <h4 className="font-semibold text-gray-900">
                  {submission.title ||
                    submission.project_title ||
                    "Project Submission"}
                </h4>

                <p className="text-sm text-gray-500">
                  {submission.student_name ||
                    submission.name ||
                    "Student"}
                </p>

              </div>

            </div>

            <div className="flex flex-wrap items-center gap-3">

              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {submission.status ||
                  "Pending"}
              </span>

              <span className="font-bold text-gray-800">
                {submission.score ?? "—"}
              </span>

              {submission.url && (
                <a
                  href={submission.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-gray-300 p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <ExternalLink size={16} />
                </a>
              )}

            </div>

          </div>
        )
      )}

    </div>
  );
}

/* ============================================================
   LEADERBOARD
============================================================ */

function LeaderboardTab({
  leaderboard,
}) {
  if (!leaderboard.length) {
    return (
      <EmptyInner
        icon={<Medal size={28} />}
        title="Leaderboard is empty"
        text="Scores will appear here after submissions are evaluated."
      />
    );
  }

  return (
    <div className="space-y-3">

      {leaderboard.map(
        (player, index) => {
          const rank =
            player.rank ??
            index + 1;

          return (
            <div
              key={
                player.id ??
                player.user_id ??
                index
              }
              className={`flex items-center gap-4 rounded-2xl border p-4 transition hover:shadow-sm ${
                rank <= 3
                  ? "border-primary-200 bg-primary-50/40"
                  : "border-gray-200 bg-white"
              }`}
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold">

                {rank === 1 ? (
                  <span className="text-xl">
                    🥇
                  </span>
                ) : rank === 2 ? (
                  <span className="text-xl">
                    🥈
                  </span>
                ) : rank === 3 ? (
                  <span className="text-xl">
                    🥉
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">
                    #{rank}
                  </span>
                )}

              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate font-semibold text-gray-900">
                  {player.name ||
                    player.student_name ||
                    "Participant"}
                </p>

                <p className="text-xs text-gray-500">
                  {player.team ||
                    player.team_name ||
                    "Individual"}
                </p>

              </div>

              <div className="text-right">

                <p className="text-lg font-black text-gray-900">
                  {player.score ?? 0}
                </p>

                <p className="text-[10px] uppercase tracking-wide text-gray-400">
                  Score
                </p>

              </div>

            </div>
          );
        }
      )}

    </div>
  );
}

/* ============================================================
   UI COMPONENTS
============================================================ */

function MetricCard({
  label,
  value,
  icon,
  color = "primary",
}) {
  const colors = {
    primary: {
      icon: "bg-primary-50 text-primary-600",
      glow: "from-primary-500/20",
    },

    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      glow: "from-emerald-500/20",
    },

    violet: {
      icon: "bg-violet-50 text-violet-600",
      glow: "from-violet-500/20",
    },

    blue: {
      icon: "bg-blue-50 text-blue-600",
      glow: "from-blue-500/20",
    },

    orange: {
      icon: "bg-orange-50 text-orange-600",
      glow: "from-orange-500/20",
    },

    pink: {
      icon: "bg-pink-50 text-pink-600",
      glow: "from-pink-500/20",
    },
  };

  const theme =
    colors[color] || colors.primary;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg">

      <div
        className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${theme.glow} to-transparent opacity-0 transition-opacity group-hover:opacity-100`}
      />

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-gray-900">
            {Number(value || 0).toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Live dashboard metric
          </p>

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${theme.icon}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

function QuickMetric({
  label,
  value,
  icon,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 transition hover:border-primary-200 hover:shadow-sm">

      <div className="flex items-center gap-2 text-gray-400">

        {icon}

        <span className="text-xs">
          {label}
        </span>

      </div>

      <p className="mt-1 truncate text-sm font-black text-gray-900">
        {value}
      </p>

    </div>
  );
}

function ScheduleItem({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">

      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-semibold text-gray-800">
        {value}
      </span>

    </div>
  );
}

function LifecycleButton({
  label,
  onClick,
  disabled,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Zap size={16} />
      {label}
    </button>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-sm font-semibold text-gray-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />

    </div>
  );
}

function DateInput({
  label,
  name,
  value,
  onChange,
  required = false,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-sm font-semibold text-gray-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <input
        type="datetime-local"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />

    </div>
  );
}

function IconButton({
  children,
  title,
  onClick,
  color = "gray",
}) {
  const colors = {
    gray:
      "text-gray-500 hover:bg-gray-100 hover:text-gray-800",

    green:
      "text-emerald-600 hover:bg-emerald-50",

    blue:
      "text-blue-600 hover:bg-blue-50",

    orange:
      "text-orange-600 hover:bg-orange-50",

    red:
      "text-red-600 hover:bg-red-50",
  };

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`rounded-lg p-2 transition ${colors[color]}`}
    >
      {children}
    </button>
  );
}

function StatusBadge({
  status,
  statusClass,
  statusLabel,
}) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(
        status
      )}`}
    >
      <CircleDot size={11} />

      {statusLabel(status)}
    </span>
  );
}

function TableHead({
  children,
  align = "left",
}) {
  return (
    <th
      className={`px-6 py-3 text-${align} text-[11px] font-bold uppercase tracking-wider text-gray-500`}
    >
      {children}
    </th>
  );
}

function Alert({
  message,
  onClose,
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
        <AlertCircle size={18} />
      </div>

      <p className="flex-1 pt-1">
        {message}
      </p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-red-500 transition hover:bg-red-100"
          aria-label="Close error"
        >
          <X size={17} />
        </button>
      )}

    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[380px] items-center justify-center">

      <div className="flex flex-col items-center gap-4">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
          <RefreshCw
            size={25}
            className="animate-spin text-primary-600"
          />
        </div>

        <div className="text-center">

          <p className="font-semibold text-gray-800">
            Loading competitions
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Fetching competition intelligence...
          </p>

        </div>

      </div>

    </div>
  );
}

function EmptyState({
  onCreate,
}) {
  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-500">
        <Trophy size={28} />
      </div>

      <h3 className="mt-5 text-lg font-black text-gray-900">
        No competitions found
      </h3>

      <p className="mt-1 max-w-md text-sm text-gray-500">
        There are no competitions matching your
        current filters. Create your first
        competition to get started.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      >
        <Plus size={17} />
        Create Competition
      </button>

    </div>
  );
}

function EmptyInner({
  icon,
  title,
  text,
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 px-6 text-center">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm text-gray-500">
        {text}
      </p>

    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
  wide = false,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-3 backdrop-blur-sm sm:p-4">

      <div
        className={`max-h-[94vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${
          wide
            ? "max-w-5xl"
            : "max-w-2xl"
        }`}
      >

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">

          <h2 className="text-lg font-black text-gray-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X size={19} />
          </button>

        </div>

        <div className="p-5 sm:p-6">
          {children}
        </div>

      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function formatDate(date) {
  if (!date) {
    return "—";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return value.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function formatShortDate(date) {
  if (!date) {
    return "—";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return value.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  );
}

function formatDateTime(date) {
  if (!date) {
    return "Not set";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Not set";
  }

  return value.toLocaleString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function toDateTimeInput(date) {
  if (!date) {
    return "";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const offset =
    value.getTimezoneOffset();

  const local = new Date(
    value.getTime() -
      offset * 60000
  );

  return local
    .toISOString()
    .slice(0, 16);
}

function getInitials(name) {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase()
    )
    .join("");
}

function getLifecycle(competition) {
  const now = new Date();

  const start = competition.start_date
    ? new Date(
        competition.start_date
      )
    : null;

  const deadline = competition.deadline
    ? new Date(
        competition.deadline
      )
    : null;

  /*
   * Explicit terminal/admin states take priority.
   */

  if (competition.status === "draft") {
    return "draft";
  }

  if (
    competition.status === "completed"
  ) {
    return "completed";
  }

  /*
   * Published competitions with a
   * future start date are upcoming.
   */

  if (
    competition.status === "published" &&
    start &&
    now < start
  ) {
    return "upcoming";
  }

  /*
   * An active competition whose deadline
   * has passed is considered completed
   * visually.
   */

  if (
    competition.status === "active" &&
    deadline &&
    now > deadline
  ) {
    return "completed";
  }

  if (
    start &&
    deadline &&
    now >= start &&
    now <= deadline &&
    competition.status !== "draft"
  ) {
    return "active";
  }

  return (
    competition.status ||
    "draft"
  );
}