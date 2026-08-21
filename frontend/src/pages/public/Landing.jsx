import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import Button from '@components/ui/Button'
import CourseCard from '@components/course/CourseCard'
import { courses, categories } from '@mocks/courses'
import { heroStats, testimonials, platformHighlights } from '@mocks/landingData'

export default function Landing() {
  const featuredCourses = courses.slice(0, 3)
  const browsableCategories = categories.filter((c) => c !== 'All')

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark via-primary-darker to-primary px-5 py-16 text-white sm:px-10 lg:py-24">
        <div className="mx-auto max-w-[1100px] text-center">
          <span className="inline-flex rounded-full bg-gold/15 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-gold">
            Free, forever
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
            Empowering Oromia through innovation and technology
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm text-white/80 sm:text-base">
            Free courses, research, competitions, and a community built for learners and innovators across the
            region.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button as={Link} to="/register" variant="secondary" className="h-12 px-6">
              Get Started Free
            </Button>
            <Button as={Link} to="/courses" variant="outline" className="h-12 border-white/40 px-6 text-white hover:bg-white/10">
              Browse Courses
            </Button>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-extrabold sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform highlights */}
      <section className="mx-auto max-w-[1100px] px-5 py-14 sm:px-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {platformHighlights.map((item) => {
            const Icon = Icons[item.icon] || Icons.Circle
            return (
              <div key={item.title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 text-sm font-bold text-ink">{item.title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Category quick links */}
      <section className="bg-surface px-5 py-12 sm:px-10">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="text-lg font-bold text-ink">Browse by category</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {browsableCategories.map((cat) => (
              <Link
                key={cat}
                to={`/courses?category=${encodeURIComponent(cat)}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="mx-auto max-w-[1100px] px-5 py-14 sm:px-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Featured Courses</h2>
          <Link to="/courses" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            View all courses <ArrowRight size={13} />
          </Link>
        </div>
        <div className="mt-5">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-surface px-5 py-14 sm:px-10">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="text-lg font-bold text-ink">What learners are saying</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <p className="text-sm italic leading-6 text-slate-600">"{t.quote}"</p>
                <p className="mt-4 text-xs font-bold text-ink">{t.name}</p>
                <p className="text-[11px] text-slate-400">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-[1100px] px-5 py-14 sm:px-10">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-hover px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-extrabold">Ready to start learning?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/80">
            Join thousands of learners across Oromia — no cost, no catch.
          </p>
          <Button as={Link} to="/register" variant="secondary" className="mt-6 h-12 px-8">
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  )
}