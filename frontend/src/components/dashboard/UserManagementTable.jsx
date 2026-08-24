import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserX,
  UserCheck,
  Pencil,
  X,
  Save,
} from "lucide-react";

import { apiRequest } from "@services/api";

export default function UserManagementTable({
  users: initialUsers = [],
}) {
  const [users, setUsers] = useState(
    Array.isArray(initialUsers)
      ? initialUsers
      : []
  );

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState("All");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [updatingUserId, setUpdatingUserId] =
    useState(null);

  const [editingUser, setEditingUser] =
    useState(null);

  const [editRole, setEditRole] =
    useState("");

  const [actionMessage, setActionMessage] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  // =====================================================
  // SYNC USERS
  // =====================================================

  useEffect(() => {
    setUsers(
      Array.isArray(initialUsers)
        ? initialUsers
        : []
    );
  }, [initialUsers]);

  // =====================================================
  // FILTER
  // =====================================================

  const filtered = useMemo(() => {
    return users.filter((user) => {
      if (
        roleFilter !== "All" &&
        user.role !== roleFilter
      ) {
        return false;
      }

      if (
        statusFilter !== "All" &&
        user.status !== statusFilter
      ) {
        return false;
      }

      if (search.trim()) {
        const query =
          search.trim().toLowerCase();

        const name =
          user.name?.toLowerCase() || "";

        const email =
          user.email?.toLowerCase() || "";

        if (
          !name.includes(query) &&
          !email.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  // =====================================================
  // OPEN ROLE EDITOR
  // =====================================================

  function openRoleEditor(user) {
    if (user.role === "Admin") {
      return;
    }

    setActionMessage("");
    setActionError("");

    setEditingUser(user);
    setEditRole(
      user.role === "Instructor"
        ? "instructor"
        : "student"
    );
  }

  // =====================================================
  // CLOSE ROLE EDITOR
  // =====================================================

  function closeRoleEditor() {
    if (updatingUserId !== null) {
      return;
    }

    setEditingUser(null);
    setEditRole("");
  }

  // =====================================================
  // SAVE ROLE
  // =====================================================

  async function saveRole() {
    if (!editingUser) {
      return;
    }

    if (editingUser.role === "Admin") {
      return;
    }

    try {
      setUpdatingUserId(
        editingUser.id
      );

      setActionMessage("");
      setActionError("");

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
          `/admin/users/${editingUser.id}/role`,
          {
            token,
            method: "PUT",
            body: {
              role: editRole,
            },
          }
        );

      setUsers((previous) =>
        previous.map((item) =>
          item.id === editingUser.id
            ? {
                ...item,
                role:
                  editRole === "instructor"
                    ? "Instructor"
                    : "Student",
              }
            : item
        )
      );

      setActionMessage(
        data.message ||
          "User role updated successfully."
      );

      setEditingUser(null);
      setEditRole("");
    } catch (error) {
      console.error(
        "Update user role error:",
        error
      );

      setActionError(
        error.message ||
          "Failed to update user role."
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  // =====================================================
  // SUSPEND / REACTIVATE
  // =====================================================

  async function toggleSuspend(user) {
    if (user.role === "Admin") {
      return;
    }

    try {
      setUpdatingUserId(user.id);

      setActionMessage("");
      setActionError("");

      const token =
        localStorage.getItem(
          "osta_token"
        );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const nextStatus =
        user.status === "Suspended"
          ? "active"
          : "suspended";

      const data =
        await apiRequest(
          `/admin/users/${user.id}/status`,
          {
            token,
            method: "PUT",
            body: {
              status: nextStatus,
            },
          }
        );

      setUsers((previous) =>
        previous.map((item) =>
          item.id === user.id
            ? {
                ...item,
                status:
                  nextStatus ===
                  "suspended"
                    ? "Suspended"
                    : "Active",
              }
            : item
        )
      );

      setActionMessage(
        data.message ||
          "Account status updated successfully."
      );
    } catch (error) {
      console.error(
        "Update user status error:",
        error
      );

      setActionError(
        error.message ||
          "Failed to update account status."
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <>
      {/* =================================================
          MAIN TABLE
      ================================================= */}

      <section className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

        {/* HEADER */}

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-5">

          <h2 className="mr-auto text-sm font-bold text-ink">
            User Management
          </h2>

          {/* SEARCH */}

          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search users..."
              className="h-9 rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* ROLE FILTER */}

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-primary"
          >
            <option value="All">
              All roles
            </option>

            <option value="Student">
              Student
            </option>

            <option value="Instructor">
              Instructor
            </option>

            <option value="Admin">
              Admin
            </option>
          </select>

          {/* STATUS FILTER */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-primary"
          >
            <option value="All">
              All statuses
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Suspended">
              Suspended
            </option>
          </select>

        </div>

        {/* ACTION MESSAGE */}

        {(actionMessage ||
          actionError) && (
          <div className="border-b border-slate-100 px-5 py-3">
            {actionMessage && (
              <p className="text-xs font-semibold text-primary">
                {actionMessage}
              </p>
            )}

            {actionError && (
              <p className="text-xs font-semibold text-red-600">
                {actionError}
              </p>
            )}
          </div>
        )}

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">

            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400">

                <th className="px-5 py-3">
                  Name
                </th>

                <th className="px-5 py-3">
                  Role
                </th>

                <th className="px-5 py-3">
                  Status
                </th>

                <th className="px-5 py-3 text-right">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {filtered.map((user) => {
                const isAdmin =
                  user.role === "Admin";

                const isUpdating =
                  updatingUserId ===
                  user.id;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/70"
                  >

                    {/* NAME */}

                    <td className="px-5 py-3">
                      <p className="font-semibold text-ink">
                        {user.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {user.email}
                      </p>
                    </td>

                    {/* ROLE */}

                    <td className="px-5 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {user.role}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          user.status ===
                          "Active"
                            ? "text-primary"
                            : "text-red-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status ===
                            "Active"
                              ? "bg-primary"
                              : "bg-red-500"
                          }`}
                        />

                        {user.status}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">

                        {/* EDIT ROLE */}

                        <button
                          type="button"
                          onClick={() =>
                            openRoleEditor(
                              user
                            )
                          }
                          disabled={
                            isAdmin ||
                            isUpdating
                          }
                          className="rounded-md p-2 text-slate-400 hover:bg-primary-light hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                          title={
                            isAdmin
                              ? "Admin account is protected"
                              : "Edit user role"
                          }
                          aria-label={`Edit role for ${user.name}`}
                        >
                          <Pencil size={15} />
                        </button>

                        {/* SUSPEND / REACTIVATE */}

                        <button
                          type="button"
                          onClick={() =>
                            toggleSuspend(
                              user
                            )
                          }
                          disabled={
                            isAdmin ||
                            isUpdating
                          }
                          className={`rounded-md p-2 ${
                            user.status ===
                            "Active"
                              ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
                              : "text-slate-400 hover:bg-primary-light hover:text-primary"
                          } disabled:cursor-not-allowed disabled:opacity-30`}
                          title={
                            isAdmin
                              ? "Admin account is protected"
                              : user.status ===
                                "Active"
                              ? "Suspend user"
                              : "Reactivate user"
                          }
                          aria-label={
                            user.status ===
                            "Active"
                              ? `Suspend ${user.name}`
                              : `Reactivate ${user.name}`
                          }
                        >
                          {user.status ===
                          "Active" ? (
                            <UserX
                              size={15}
                            />
                          ) : (
                            <UserCheck
                              size={15}
                            />
                          )}
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}

              {/* EMPTY */}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    No users match your filters.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </section>

      {/* =================================================
          ROLE EDIT MODAL
      ================================================= */}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 p-5">

              <div>
                <h2 className="text-base font-bold text-ink">
                  Edit User Role
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Change the role for{" "}
                  {editingUser.name}.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeRoleEditor
                }
                disabled={
                  updatingUserId !== null
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="space-y-5 p-5">

              <div>
                <label
                  htmlFor="edit-role"
                  className="mb-1.5 block text-xs font-bold text-slate-600"
                >
                  Role
                </label>

                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(e) =>
                    setEditRole(
                      e.target.value
                    )
                  }
                  disabled={
                    updatingUserId !== null
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="student">
                    Student
                  </option>

                  <option value="instructor">
                    Instructor
                  </option>
                </select>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">
                  Admin accounts are protected and
                  cannot be changed from this page.
                </p>
              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="flex justify-end gap-3 border-t border-slate-100 p-5">

              <button
                type="button"
                onClick={
                  closeRoleEditor
                }
                disabled={
                  updatingUserId !== null
                }
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveRole}
                disabled={
                  updatingUserId !== null
                }
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={15} />

                {updatingUserId !== null
                  ? "Saving..."
                  : "Save Role"}
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}