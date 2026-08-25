import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Circle,
  Info,
  MessageCircle,
  FileText,
  Award,
  BookOpen,
  AlertCircle,
} from "lucide-react";

import { apiRequest } from "@services/api";

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(
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

function getCategoryIcon(category) {
  switch (
    String(category || "")
      .toLowerCase()
  ) {
    case "assignment":
      return <FileText size={18} />;

    case "course":
      return <BookOpen size={18} />;

    case "certificate":
      return <Award size={18} />;

    case "discussion":
      return <MessageCircle size={18} />;

    case "system":
      return <AlertCircle size={18} />;

    default:
      return <Info size={18} />;
  }
}

export default function Notifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !Boolean(
              notification.is_read
            )
        ).length,
      [notifications]
    );

  // =====================================================
  // LOAD
  // =====================================================

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const data =
        await apiRequest(
          "/notifications/my"
        );

      setNotifications(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Notifications error:",
        err
      );

      setError(
        err.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  // =====================================================
  // MARK ONE READ
  // =====================================================

  async function markRead(id) {
    try {
      await apiRequest(
        `/notifications/${id}/read`,
        {
          method: "PUT",
        }
      );

      setNotifications(
        (previous) =>
          previous.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    is_read: 1,
                  }
                : item
          )
      );
    } catch (err) {
      console.error(
        "Mark read error:",
        err
      );

      setError(
        err.message ||
          "Failed to update notification."
      );
    }
  }

  // =====================================================
  // MARK ALL READ
  // =====================================================

  async function markAllRead() {
    if (!unreadCount) {
      return;
    }

    try {
      setActionLoading(true);

      await apiRequest(
        "/notifications/my/read-all",
        {
          method: "PUT",
        }
      );

      setNotifications(
        (previous) =>
          previous.map(
            (item) => ({
              ...item,
              is_read: 1,
            })
          )
      );
    } catch (err) {
      console.error(
        "Mark all read error:",
        err
      );

      setError(
        err.message ||
          "Failed to mark notifications as read."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // =====================================================
  // DELETE
  // =====================================================

  async function deleteNotification(
    id
  ) {
    try {
      setActionLoading(true);

      await apiRequest(
        `/notifications/${id}`,
        {
          method: "DELETE",
        }
      );

      setNotifications(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== id
          )
      );
    } catch (err) {
      console.error(
        "Delete notification error:",
        err
      );

      setError(
        err.message ||
          "Failed to delete notification."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
        <Bell
          size={38}
          className="mx-auto animate-pulse text-primary/40"
        />

        <p className="mt-4 text-sm text-slate-500">
          Loading your notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="rounded-2xl bg-[#0F172A] p-6 text-white shadow-lg sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <Bell size={24} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold sm:text-2xl">
                Notifications
              </h1>

              <p className="mt-1 text-xs text-slate-300">
                Stay up to date with your OSTA learning activity.
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <div className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white">
              {unreadCount} unread
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">
          {notifications.length} notification
          {notifications.length === 1
            ? ""
            : "s"}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={
              markAllRead
            }
            disabled={
              unreadCount === 0 ||
              actionLoading
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={14} />
            Mark all as read
          </button>
        </div>
      </section>

      {/* =================================================
          EMPTY
      ================================================= */}

      {notifications.length ===
      0 ? (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Bell size={25} />
          </div>

          <h2 className="mt-4 text-base font-bold text-ink">
            You're all caught up
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            New updates about your courses, assignments,
            assessments, certificates, and community activity
            will appear here.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {notifications.map(
            (notification) => {
              const unread =
                !Boolean(
                  notification.is_read
                );

              return (
                <article
                  key={
                    notification.id
                  }
                  className={`border-b border-slate-100 p-5 last:border-b-0 ${
                    unread
                      ? "bg-primary-light/20"
                      : "bg-white"
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        unread
                          ? "bg-primary-light text-primary"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {getCategoryIcon(
                        notification.category
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-ink">
                              {
                                notification.title
                              }
                            </h3>

                            {unread && (
                              <Circle
                                size={7}
                                fill="currentColor"
                                className="text-primary"
                              />
                            )}
                          </div>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {
                              notification.category
                            }{" "}
                            ·{" "}
                            {formatDate(
                              notification.created_at
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            deleteNotification(
                              notification.id
                            )
                          }
                          disabled={
                            actionLoading
                          }
                          aria-label="Delete notification"
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>
                      </div>

                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                        {
                          notification.message
                        }
                      </p>

                      {unread && (
                        <button
                          type="button"
                          onClick={() =>
                            markRead(
                              notification.id
                            )
                          }
                          className="mt-3 text-xs font-bold text-primary hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}
    </div>
  );
}