import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  FileText,
  Award,
  Users,
  UserCircle,
} from "lucide-react";

function StudentLayout() {
  const navigation = [
    {
      name: "Dashboard",
      path: "/student",
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "My Courses",
      path: "/student/courses",
      icon: BookOpen,
    },
    {
      name: "Progress",
      path: "/student/progress",
      icon: BarChart3,
    },
    {
      name: "Assignments",
      path: "/student/assignments",
      icon: FileText,
    },
    {
      name: "Certificates",
      path: "/student/certificates",
      icon: Award,
    },
    {
      name: "Community",
      path: "/student/community",
      icon: Users,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: UserCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 font-bold text-white">
              O
            </div>

            <div>
              <h1 className="font-bold text-slate-900">
                OSTA
              </h1>

              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                E-Learning
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-green-700"
                  }`
                }
              >
                <Icon size={19} />

                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main area */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">
          <div>
            <p className="text-sm text-slate-500">
              Student Portal
            </p>

            <h2 className="font-semibold text-slate-900">
              Innovation E-Learning
            </h2>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
            S
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;