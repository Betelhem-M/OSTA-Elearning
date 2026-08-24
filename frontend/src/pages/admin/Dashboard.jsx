import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  FileText,
  Trophy,
  RefreshCw,
} from "lucide-react";

import StatCard from "@components/dashboard/StatCard";
import UserManagementTable from "@components/dashboard/UserManagementTable";
import ModerationQueue from "@components/dashboard/ModerationQueue";

import { apiRequest } from "@services/api";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState({
    stats: {
      totalUsers: 0,
      totalCourses: 0,
      totalAssignments: 0,
      totalCompetitions: 0,
    },

    users: [],

    moderationQueue: [],
  });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD ADMIN DASHBOARD
  // =====================================================

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "osta_token"
        );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const data =
        await apiRequest(
          "/admin/dashboard",
          {
            token,
          }
        );

      setDashboard({
        stats: {
          totalUsers:
            Number(
              data?.stats?.totalUsers
            ) || 0,

          totalCourses:
            Number(
              data?.stats?.totalCourses
            ) || 0,

          totalAssignments:
            Number(
              data?.stats?.totalAssignments
            ) || 0,

          totalCompetitions:
            Number(
              data?.stats?.totalCompetitions
            ) || 0,
        },

        users:
          Array.isArray(
            data?.users
          )
            ? data.users
            : [],

        moderationQueue:
          Array.isArray(
            data?.moderationQueue
          )
            ? data.moderationQueue
            : [],
      });
    } catch (err) {
      console.error(
        "Admin dashboard error:",
        err
      );

      setError(
        err.message ||
          "Failed to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // =====================================================
  // STAT CARDS
  // =====================================================

  const adminStats = [
    {
      icon: "Users",
      label: "Total Users",
      value:
        dashboard.stats.totalUsers.toLocaleString(),
    },

    {
      icon: "BookOpen",
      label: "Total Courses",
      value:
        dashboard.stats.totalCourses.toLocaleString(),
    },

    {
      icon: "FileText",
      label: "Total Assignments",
      value:
        dashboard.stats.totalAssignments.toLocaleString(),
    },

    {
      icon: "Trophy",
      label: "Total Competitions",
      value:
        dashboard.stats.totalCompetitions.toLocaleString(),
    },
  ];

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
        <p className="text-sm text-slate-500">
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage users, courses, and platform activity.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {adminStats.map(
          (stat) => (
            <StatCard
              key={stat.label}
              {...stat}
            />
          )
        )}
      </div>

      {/* =================================================
          USERS
      ================================================= */}

      <UserManagementTable
        users={dashboard.users}
      />

      {/* =================================================
          MODERATION
      ================================================= */}

      <ModerationQueue
        items={dashboard.moderationQueue}
      />
    </div>
  );
}