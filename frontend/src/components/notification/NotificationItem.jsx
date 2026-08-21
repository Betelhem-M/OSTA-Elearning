import {
  CheckCircle2,
  Calendar,
  BookOpen,
  MessageSquare,
  Trophy,
  X,
} from "lucide-react";

const CATEGORY_ICONS = {
  Assignments: CheckCircle2,
  Competitions: Trophy,
  Courses: BookOpen,
  Events: Calendar,
  Messages: MessageSquare,
};

export default function NotificationItem({
  notification,
  onMarkRead,
  onDismiss,
}) {
  const Icon = CATEGORY_ICONS[notification.category] || BookOpen;

  return (
    <li
      onClick={() => onMarkRead(notification.id)}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
        notification.unread
          ? "border-primary/20 bg-primary-light/40"
          : "border-slate-100 bg-white"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${notification.unread ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}
      >
        <Icon size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-ink">{notification.title}</p>
          {notification.unread && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {notification.badge} · {notification.timestamp}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification.id);
        }}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-600"
      >
        <X size={15} />
      </button>
    </li>
  );
}
