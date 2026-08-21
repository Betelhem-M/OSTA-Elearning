import { useState, useMemo } from "react";
import { useNotifications } from "@context/NotificationContext";
import NotificationItem from "./NotificationItem";

const CATEGORIES = [
  "All",
  "Assignments",
  "Courses",
  "Events",
  "Messages",
  "Competitions",
];

export default function NotificationCenter() {
  const { notifications, markAsRead, markAllAsRead, dismiss, unreadCount } =
    useNotifications();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    if (activeCategory === "All") return notifications;
    return notifications.filter((n) => n.category === activeCategory);
  }, [notifications, activeCategory]);

  return (
    <div className="mx-auto max-w-[720px] px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary-light disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
        >
          Mark all as read
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              activeCategory === cat
                ? "bg-primary text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <ul className="mt-5 space-y-2.5">
        {filtered.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onMarkRead={markAsRead}
            onDismiss={dismiss}
          />
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-slate-400">
          No notifications in this category.
        </p>
      )}
    </div>
  );
}
