import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Clock3,
  MapPin,
  RefreshCw,
  X,
} from "lucide-react";

import EventCalendar from "@components/event/EventCalendar";
import EventCard from "@components/event/EventCard";

import { apiRequest } from "@services/api";

// =====================================================
// HELPERS
// =====================================================

function normalizeDate(value) {
  if (!value) return "";

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date
    .toISOString()
    .slice(0, 10);
}

function formatDate(value) {
  if (!value) return "Date not available";

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
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function formatTime(value) {
  if (!value) return "";

  // Handles values returned as
  // HH:MM:SS or already formatted time.
  if (
    typeof value === "string" &&
    /^\d{2}:\d{2}/.test(value)
  ) {
    const parts =
      value.split(":");

    const hour =
      Number(parts[0]);

    const minute =
      Number(parts[1]);

    if (
      Number.isFinite(hour) &&
      Number.isFinite(minute)
    ) {
      const temp =
        new Date();

      temp.setHours(
        hour,
        minute,
        0,
        0
      );

      return temp.toLocaleTimeString(
        undefined,
        {
          hour: "numeric",
          minute: "2-digit",
        }
      );
    }
  }

  return String(value);
}

function normalizeEvent(event) {
  return {
    ...event,

    date:
      normalizeDate(
        event.event_date
      ),

    time:
      formatTime(
        event.event_time
      ),

    location:
      event.location ||
      "Location to be announced",

    category:
      event.category ||
      "General",

    description:
      event.description ||
      "More information about this event will be available soon.",
  };
}

// =====================================================
// PAGE
// =====================================================

export default function EventsCalendar() {
  const [
    events,
    setEvents,
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
    selectedDate,
    setSelectedDate,
  ] = useState(null);

  const [
    category,
    setCategory,
  ] = useState("All");

  // =====================================================
  // LOAD EVENTS
  // =====================================================

  async function loadEvents({
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
          "/events"
        );

      const normalized =
        Array.isArray(data)
          ? data.map(
              normalizeEvent
            )
          : [];

      setEvents(
        normalized
      );
    } catch (err) {
      console.error(
        "Events load error:",
        err
      );

      setEvents([]);

      setError(
        err.message ||
          "We couldn't load the events right now."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  // =====================================================
  // CATEGORIES FROM REAL DATA
  // =====================================================

  const eventCategories =
    useMemo(() => {
      const values =
        events
          .map(
            (event) =>
              event.category
          )
          .filter(Boolean);

      return [
        "All",
        ...Array.from(
          new Set(values)
        ),
      ];
    }, [events]);

  // =====================================================
  // FILTER EVENTS
  // =====================================================

  const filteredEvents =
    useMemo(() => {
      return events.filter(
        (event) => {
          if (
            category !==
              "All" &&
            event.category !==
              category
          ) {
            return false;
          }

          if (
            selectedDate &&
            event.date !==
              selectedDate
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      events,
      category,
      selectedDate,
    ]);

  // =====================================================
  // UPCOMING EVENTS
  // =====================================================

  const upcomingEvents =
    useMemo(() => {
      const today =
        normalizeDate(
          new Date()
        );

      return events.filter(
        (event) =>
          event.date >= today
      );
    }, [events]);

  // =====================================================
  // TODAY
  // =====================================================

  const todayEvents =
    useMemo(() => {
      const today =
        normalizeDate(
          new Date()
        );

      return events.filter(
        (event) =>
          event.date === today
      );
    }, [events]);

  // =====================================================
  // CLEAR DATE
  // =====================================================

  function clearDate() {
    setSelectedDate(null);
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="mx-auto max-w-[1100px] px-5 py-10 lg:px-10">
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
          <CalendarDays
            size={42}
            className="mx-auto animate-pulse text-primary/40"
          />

          <h1 className="mt-4 text-lg font-bold text-ink">
            Loading OSTA Events
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Fetching the latest workshops, conferences, and events.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 lg:px-10">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="relative overflow-hidden rounded-2xl bg-[#0F172A] p-7 text-white shadow-lg sm:p-9">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

        <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <CalendarDays
                  size={23}
                />
              </div>

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
                OSTA Events
              </span>
            </div>

            <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
              Events Calendar
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Discover workshops, conferences, technology
              sessions, competitions, and other events happening
              across the OSTA platform.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadEvents({
                refresh: true,
              })
            }
            disabled={refreshing}
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
              : "Refresh Events"}
          </button>
        </div>
      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <section className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <CalendarDays
              size={20}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <h2 className="text-sm font-bold text-amber-800">
                Events are temporarily unavailable
              </h2>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                We couldn't retrieve the latest events from
                the server. Please try refreshing the page.
              </p>

              <p className="mt-2 text-[11px] text-amber-600">
                {error}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          REAL DATA STATS
      ================================================= */}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">
            Total Events
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink">
            {events.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">
            Upcoming
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink">
            {upcomingEvents.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">
            Today
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink">
            {todayEvents.length}
          </p>
        </div>
      </div>

      {/* =================================================
          NO EVENTS
      ================================================= */}

      {events.length === 0 &&
      !error ? (
        <section className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
            <CalendarDays
              size={26}
            />
          </div>

          <h2 className="mt-4 text-lg font-bold text-ink">
            No events have been scheduled yet
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
            New OSTA workshops, conferences, training sessions,
            and community events will appear here as soon as
            they are published.
          </p>
        </section>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* =================================================
              CALENDAR
          ================================================= */}

          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-ink">
                Browse by date
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Select a date to see scheduled events.
              </p>
            </div>

            <EventCalendar
              events={events}
              selectedDate={
                selectedDate
              }
              onSelectDate={(date) =>
                setSelectedDate(
                  date ===
                    selectedDate
                    ? null
                    : date
                )
              }
            />
          </section>

          {/* =================================================
              EVENTS
          ================================================= */}

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">
                  Upcoming Events
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {filteredEvents.length} event
                  {filteredEvents.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  matching your filters
                </p>
              </div>

              {selectedDate && (
                <button
                  type="button"
                  onClick={clearDate}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <X size={13} />
                  Clear date
                </button>
              )}
            </div>

            {/* CATEGORY FILTERS */}

            <div className="mt-4 flex flex-wrap gap-2">
              {eventCategories.map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setCategory(
                        cat
                      )
                    }
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      category ===
                      cat
                        ? "bg-primary text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            {/* SELECTED DATE */}

            {selectedDate && (
              <div className="mt-4 rounded-xl bg-primary-light px-4 py-3">
                <p className="text-xs font-bold text-primary">
                  Showing events for{" "}
                  {formatDate(
                    selectedDate
                  )}
                </p>
              </div>
            )}

            {/* EVENT LIST */}

            <div className="mt-4 space-y-3">
              {filteredEvents.map(
                (event) => (
                  <div
                    key={event.id}
                    className="group"
                  >
                    <EventCard
                      event={event}
                    />

                    {/* Extra real-data metadata */}
                    <div className="-mt-2 rounded-b-xl border border-t-0 border-slate-100 bg-white px-4 pb-4 pt-2">
                      <div className="flex flex-wrap gap-4 text-[11px] text-slate-400">
                        {event.time && (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3
                              size={13}
                            />
                            {event.time}
                          </span>
                        )}

                        {event.location && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin
                              size={13}
                            />
                            {event.location}
                          </span>
                        )}
                      </div>

                      {event.creator_name && (
                        <p className="mt-2 text-[11px] text-slate-400">
                          Published by{" "}
                          <span className="font-semibold text-slate-500">
                            {
                              event.creator_name
                            }
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}

              {filteredEvents.length ===
                0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
                  <CalendarDays
                    size={35}
                    className="mx-auto text-slate-300"
                  />

                  <h3 className="mt-3 text-sm font-bold text-ink">
                    No events match your filters
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Try another category or choose a different date.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setCategory(
                        "All"
                      );
                      setSelectedDate(
                        null
                      );
                    }}
                    className="mt-4 text-xs font-bold text-primary hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}