import { useState, useMemo } from 'react'
import { events, eventCategories } from '@mocks/eventsData'
import EventCalendar from '@components/event/EventCalendar'
import EventCard from '@components/event/EventCard'

export default function EventsCalendar() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [category, setCategory] = useState('All')

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (category !== 'All' && e.category !== category) return false
      if (selectedDate && e.date !== selectedDate) return false
      return true
    })
  }, [category, selectedDate])

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-extrabold text-ink">Events Calendar</h1>
      <p className="mt-1 text-sm text-slate-500">Workshops, conferences, and campus events across OSTA.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <EventCalendar events={events} selectedDate={selectedDate} onSelectDate={(d) => setSelectedDate(d === selectedDate ? null : d)} />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {eventCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    category === cat ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {selectedDate && (
              <button onClick={() => setSelectedDate(null)} className="text-xs font-bold text-primary hover:underline">
                Clear date filter
              </button>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            {filteredEvents.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">No events match your filters.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}