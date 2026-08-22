import { useState, useMemo } from "react";
import { Search, UserX, UserCheck } from "lucide-react";

export default function UserManagementTable({ users: initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(() => {
    return users.filter((user) => {
      if (roleFilter !== "All" && user.role !== roleFilter) return false;
      if (statusFilter !== "All" && user.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !user.name.toLowerCase().includes(q) &&
          !user.email.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  function toggleSuspend(user) {
    const isSuspended = user.status === "Suspended";
    const confirmed = window.confirm(
      isSuspended
        ? `Reactivate ${user.name}'s account?`
        : `Suspend ${user.name}'s account?`,
    );
    if (!confirmed) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: isSuspended ? "Active" : "Suspended" }
          : u,
      ),
    );
  }

  return (
    <section className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-5">
        <h2 className="mr-auto text-sm font-bold text-ink">User Management</h2>

        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="h-9 rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-primary"
        >
          <option value="All">All roles</option>
          <option value="Student">Student</option>
          <option value="Instructor">Instructor</option>
          <option value="Admin">Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-primary"
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-3">
                  <p className="font-semibold text-ink">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      user.status === "Active" ? "text-primary" : "text-red-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${user.status === "Active" ? "bg-primary" : "bg-red-500"}`}
                    />
                    {user.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => toggleSuspend(user)}
                    className={`inline-flex items-center gap-1.5 rounded-md p-2 ${
                      user.status === "Active"
                        ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
                        : "text-slate-400 hover:bg-primary-light hover:text-primary"
                    }`}
                    aria-label={
                      user.status === "Active"
                        ? `Suspend ${user.name}`
                        : `Reactivate ${user.name}`
                    }
                  >
                    {user.status === "Active" ? (
                      <UserX size={15} />
                    ) : (
                      <UserCheck size={15} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-sm text-slate-400"
                >
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
