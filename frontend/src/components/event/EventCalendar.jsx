import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendarMonth } from "@hooks/useCalendarMonth";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EventCalendar({ events, selectedDate, onSelectDate }) {
  const calendar = useCalendarMonth(new Date(2025, 6, 1)); // seeded to July 2025, where real events exist

  const eventsByDate = events.reduce((map, event) => {
    map[event.date] = map[event.date] || [];
    map[event.date].push(event);
    return map;
  }, {});

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">{calendar.label}</h2>
        <div className="flex gap-1">
          <button
            onClick={calendar.goToPrevMonth}
            aria-label="Previous month"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={calendar.goToNextMonth}
            aria-label="Next month"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-slate-400">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {calendar.cells.map((cell, i) => {
          const hasEvents =
            !cell.outside && eventsByDate[cell.dateKey]?.length > 0;
          const isSelected = !cell.outside && cell.dateKey === selectedDate;

          return (
            <button
              key={i}
              disabled={cell.outside}
              onClick={() => onSelectDate(cell.dateKey)}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition ${
                cell.outside
                  ? "cursor-default text-transparent"
                  : isSelected
                    ? "bg-primary text-white font-bold"
                    : hasEvents
                      ? "bg-primary-light font-bold text-primary hover:bg-primary/20"
                      : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cell.day}
              {hasEvents && !isSelected && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
