import { useState } from "react";
import { Check, X } from "lucide-react";

export default function ModerationQueue({ items: initialItems }) {
  const [items, setItems] = useState(initialItems);

  function resolve(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">Content Moderation</h2>
        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
          {items.length} pending
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-center text-sm text-slate-400">
          No items awaiting review.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-100 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">{item.type}</span>
                <span className="text-[11px] text-slate-400">
                  Reported by {item.reportedBy}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">{item.excerpt}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => resolve(item.id)}
                  className="flex-1 rounded-md bg-primary py-2 text-xs font-semibold text-white hover:bg-primary-hover"
                >
                  <Check size={13} className="mr-1 inline" /> Approve
                </button>
                <button
                  onClick={() => resolve(item.id)}
                  className="flex-1 rounded-md border border-red-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <X size={13} className="mr-1 inline" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
