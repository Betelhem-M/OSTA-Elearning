import StatCard from "@components/dashboard/StatCard";
import UserManagementTable from "@components/dashboard/UserManagementTable";
import ModerationQueue from "@components/dashboard/ModerationQueue";
import { adminStats, users, moderationQueue } from "@mocks/adminData";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-ink">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage users, courses, and platform health.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <UserManagementTable users={users} />

      <ModerationQueue items={moderationQueue} />
    </div>
  );
}
