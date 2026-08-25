import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Layers3,
  Users,
  Lightbulb,
  FlaskConical,
  Trophy,
  MessageCircle,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

import Button from "@components/ui/Button";
import CourseCard from "@components/course/CourseCard";

import { apiRequest } from "@services/api";

const PLATFORM_FEATURES = [
  {
    title: "Learn",
    description:
      "Access courses and build practical technology skills through structured learning.",
    icon: GraduationCap,
  },
  {
    title: "Innovate",
    description:
      "Turn ideas into practical projects and connect with an ecosystem built for innovation.",
    icon: Lightbulb,
  },
  {
    title: "Research",
    description:
      "Explore research opportunities, publications, and technology-focused work.",
    icon: FlaskConical,
  },
  {
    title: "Connect",
    description:
      "Take part in discussions, events, competitions, and the wider OSTA community.",
    icon: Users,
  },
];

function normalizeCourse(course) {
  return {
    ...course,
    price:
      course.price === null ||
      course.price === undefined
        ? 0
        : Number(course.price),
  };
}

export default function Landing() {
  const [courses, setCourses] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD REAL PUBLIC DATA
  // =====================================================

  async function loadLandingData({
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
        coursesResponse,
        categoriesResponse,
      ] = await Promise.all([
        apiRequest("/courses"),
        apiRequest("/categories"),
      ]);

      const realCourses =
        Array.isArray(
          coursesResponse
        )
          ? coursesResponse.map(
              normalizeCourse
            )
          : [];

      const realCategories =
        Array.isArray(
          categoriesResponse
        )
          ? categoriesResponse
          : [];

      setCourses(realCourses);
      setCategories(
        realCategories
      );
    } catch (err) {
      console.error(
        "Landing page error:",
        err
      );

      setCourses([]);
      setCategories([]);

      setError(
        err.message ||
          "We couldn't load the latest OSTA content."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadLandingData();
  }, []);

  // =====================================================
  // ONLY PUBLISHED COURSES
  // =====================================================

  const publishedCourses =
    useMemo(() => {
      return courses.filter(
        (course) =>
          !course.status ||
          course.status ===
            "published"
      );
    }, [courses]);

  // =====================================================
  // FEATURED COURSES
  // =====================================================

  const featuredCourses =
    useMemo(() => {
      return publishedCourses
        .slice(0, 3);
    }, [publishedCourses]);

  // =====================================================
  // CATEGORIES
  // =====================================================

  const browsableCategories =
    useMemo(() => {
      return categories
        .filter(
          (category) =>
            category?.name
        )
        .slice(0, 12);
    }, [categories]);

  // =====================================================
  // REAL PLATFORM STATISTICS
  // =====================================================

  const freeCourses =
    useMemo(() => {
      return publishedCourses.filter(
        (course) =>
          Number(
            course.price || 0
          ) === 0
      ).length;
    }, [publishedCourses]);

  const instructorCount =
    useMemo(() => {
      const instructors =
        publishedCourses
          .map(
            (course) =>
              course.instructor_id
          )
          .filter(Boolean);

      return new Set(
        instructors
      ).size;
    }, [publishedCourses]);

  // =====================================================
  // HERO STATS
  // =====================================================

  const heroStats = [
    {
      value:
        publishedCourses.length,
      label: "Published courses",
    },
    {
      value:
        browsableCategories.length,
      label: "Learning categories",
    },
    {
      value: freeCourses,
      label: "Free courses",
    },
    {
      value:
        instructorCount,
      label: "Course instructors",
    },
  ];

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-[70vh]">
        <section className="bg-gradient-to-br from-primary-dark via-primary-darker to-primary px-5 py-16 text-white sm:px-10 lg:py-24">
          <div className="mx-auto max-w-[1100px] text-center">
            <div className="mx-auto h-7 w-40 animate-pulse rounded-full bg-white/10" />

            <div className="mx-auto mt-6 h-12 max-w-3xl animate-pulse rounded-xl bg-white/10 sm:h-16" />

            <div className="mx-auto mt-5 h-16 max-w-xl animate-pulse rounded-xl bg-white/10" />

            <div className="mt-8 flex justify-center gap-3">
              <div className="h-12 w-40 animate-pulse rounded-lg bg-white/10" />

              <div className="h-12 w-40 animate-pulse rounded-lg bg-white/10" />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1100px] px-5 py-14 sm:px-10">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* =================================================
          HERO
      ================================================= */}

      <section className="bg-gradient-to-br from-primary-dark via-primary-darker to-primary px-5 py-16 text-white sm:px-10 lg:py-24">
        <div className="mx-auto max-w-[1100px] text-center">
          <span className="inline-flex rounded-full bg-gold/15 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-gold">
            OSTA Learning & Innovation Platform
          </span>

          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
            Empowering Oromia through innovation and technology
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
            Learn practical technology skills, explore
            research and innovation opportunities, join
            competitions, attend events, and connect with
            a growing community of learners and innovators.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              as={Link}
              to="/register"
              variant="secondary"
              className="h-12 px-6"
            >
              Get Started Free
            </Button>

            <Button
              as={Link}
              to="/courses"
              variant="outline"
              className="h-12 border-white/40 px-6 text-white hover:bg-white/10"
            >
              Browse Courses
            </Button>
          </div>

          {/* REAL DATABASE STATS */}

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {heroStats.map(
              (stat) => (
                <div
                  key={stat.label}
                >
                  <p className="text-2xl font-extrabold sm:text-3xl">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-white/60">
                    {stat.label}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <section className="mx-auto max-w-[1100px] px-5 pt-6 sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <div>
              <p className="text-sm font-bold text-amber-800">
                Some platform data couldn't be loaded
              </p>

              <p className="mt-1 text-xs text-amber-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadLandingData({
                  refresh: true,
                })
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
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
                : "Try Again"}
            </button>
          </div>
        </section>
      )}

      {/* =================================================
          PLATFORM HIGHLIGHTS
      ================================================= */}

      <section className="mx-auto max-w-[1100px] px-5 py-14 sm:px-10">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            One platform
          </p>

          <h2 className="mt-2 text-xl font-extrabold text-ink sm:text-2xl">
            Learn, innovate, research, and connect
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            OSTA brings the core parts of a technology and
            innovation ecosystem together in one place.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_FEATURES.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <div
                  key={
                    item.title
                  }
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Icon
                      size={20}
                    />
                  </span>

                  <h3 className="mt-4 text-sm font-bold text-ink">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {
                      item.description
                    }
                  </p>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* =================================================
          BROWSE BY CATEGORY
      ================================================= */}

      <section className="bg-surface px-5 py-12 sm:px-10">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Explore
              </p>

              <h2 className="mt-2 text-lg font-bold text-ink">
                Browse by category
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Explore real course categories available on OSTA.
              </p>
            </div>

            <Link
              to="/courses"
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              View all courses
              <ArrowRight
                size={13}
              />
            </Link>
          </div>

          {browsableCategories.length >
          0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {browsableCategories.map(
                (category) => (
                  <Link
                    key={
                      category.id
                    }
                    to={`/courses?category=${encodeURIComponent(
                      category.name
                    )}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                  >
                    {category.name}
                  </Link>
                )
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
              <Layers3
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-2 text-sm font-semibold text-slate-500">
                No course categories are available yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          FEATURED COURSES
      ================================================= */}

      <section className="mx-auto max-w-[1100px] px-5 py-14 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Start learning
            </p>

            <h2 className="mt-2 text-lg font-bold text-ink sm:text-xl">
              Featured Courses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Discover courses currently available on the platform.
            </p>
          </div>

          <Link
            to="/courses"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            View all courses
            <ArrowRight
              size={13}
            />
          </Link>
        </div>

        {featuredCourses.length >
        0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map(
              (course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                />
              )
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <BookOpen
              size={40}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 text-base font-bold text-ink">
              Courses are coming soon
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are no published courses available yet.
              Once instructors publish courses, they will appear
              here automatically.
            </p>

            <Link
              to="/courses"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover"
            >
              Open Course Marketplace
              <ArrowRight
                size={14}
              />
            </Link>
          </div>
        )}
      </section>

      {/* =================================================
          COMMUNITY / ECOSYSTEM
      ================================================= */}

      <section className="bg-surface px-5 py-14 sm:px-10">
        <div className="mx-auto grid max-w-[1100px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/innovation-hub"
            className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Lightbulb
              size={22}
              className="text-primary"
            />

            <h3 className="mt-4 text-sm font-bold text-ink">
              Innovation Hub
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Explore ideas, startups, hackathons, and innovation opportunities.
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">
              Explore
              <ArrowRight
                size={13}
                className="transition group-hover:translate-x-0.5"
              />
            </span>
          </Link>

          <Link
            to="/research"
            className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <FlaskConical
              size={22}
              className="text-primary"
            />

            <h3 className="mt-4 text-sm font-bold text-ink">
              Research Portal
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Discover research-focused work and opportunities across OSTA.
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">
              Explore
              <ArrowRight
                size={13}
              />
            </span>
          </Link>

          <Link
            to="/competitions"
            className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Trophy
              size={22}
              className="text-primary"
            />

            <h3 className="mt-4 text-sm font-bold text-ink">
              Competitions
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Challenge yourself through competitions, hackathons, and technology events.
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">
              Explore
              <ArrowRight
                size={13}
              />
            </span>
          </Link>

          <Link
            to="/discussion"
            className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <MessageCircle
              size={22}
              className="text-primary"
            />

            <h3 className="mt-4 text-sm font-bold text-ink">
              Community
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Ask questions, exchange ideas, and connect with other learners.
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">
              Join the discussion
              <ArrowRight
                size={13}
              />
            </span>
          </Link>
        </div>
      </section>

      {/* =================================================
          EVENTS PROMO
      ================================================= */}

      <section className="mx-auto max-w-[1100px] px-5 py-14 sm:px-10">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-slate-100 bg-white p-7 shadow-sm sm:flex-row sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
              <CalendarDays
                size={21}
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">
                Stay connected with OSTA events
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                Find workshops, conferences, training sessions,
                and other events as they are published.
              </p>
            </div>
          </div>

          <Link
            to="/events"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-bold text-white hover:bg-primary-hover"
          >
            View Events
            <ArrowRight
              size={14}
            />
          </Link>
        </div>
      </section>

      {/* =================================================
          FINAL CTA
      ================================================= */}

      <section className="mx-auto max-w-[1100px] px-5 py-14 sm:px-10">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-hover px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-extrabold">
            Ready to start learning?
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/80">
            Join OSTA and access technology learning,
            research, innovation, competitions, and community
            opportunities.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              as={Link}
              to="/register"
              variant="secondary"
              className="h-12 px-8"
            >
              Get Started Free
            </Button>

            <Button
              as={Link}
              to="/courses"
              variant="outline"
              className="h-12 border-white/40 px-8 text-white hover:bg-white/10"
            >
              Browse Courses
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}