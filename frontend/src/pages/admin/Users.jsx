import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import UserManagementTable from "@components/dashboard/UserManagementTable";
import { apiRequest } from "@services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadUsers() {
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
          "/admin/users",
          {
            token,
          }
        );

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Admin users error:",
        err
      );

      setError(
        err.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
        <p className="text-sm text-slate-500">
          Loading users...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink">
            User Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage user roles and account access.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadUsers}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* USERS */}

      <UserManagementTable
        users={users}
      />

    </div>
  );
}