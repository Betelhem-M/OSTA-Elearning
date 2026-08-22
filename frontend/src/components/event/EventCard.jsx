import { useState } from "react";
import { MapPin, Clock } from "lucide-react";

export default function EventCard({ event }) {
  const [isRegistered, setIsRegistered] = useState(false);

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="rounded-full bg-primary-light px-2.5 py-1 text-[10px] font-bold text-primary">
            {event.category}
          </span>
          <h3 className="mt-2 text-sm font-bold text-ink">{event.title}</h3>
        </div>
      </div>

      <div className="mt-2 space-y-1 text-xs text-slate-500">
        <p className="flex items-center gap-1.5">
          <Clock size={13} /> {event.time}
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin size={13} /> {event.location}
        </p>
      </div>

      <button
        onClick={() => setIsRegistered(true)}
        disabled={isRegistered}
        className={`mt-3 w-full rounded-lg py-2 text-xs font-bold transition ${
          isRegistered
            ? "cursor-default bg-primary-light text-primary"
            : "bg-primary text-white hover:bg-primary-hover"
        }`}
      >
        {isRegistered ? "Registered ✓" : "Register"}
      </button>
    </div>
  );
}
