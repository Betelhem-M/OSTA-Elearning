import {
  Outlet,
  Link,
} from "react-router-dom";

import Sidebar from "@components/layout/Sidebar";
import Navbar from "@components/layout/Navbar";

import {
  INSTRUCTOR_SIDEBAR_NAV,
} from "@constants/navigation";

import {
  useSidebarDrawer,
} from "@hooks/useSidebarDrawer";

import {
  useAuth,
} from "@context/AuthContext";

export default function InstructorLayout() {
  const drawer =
    useSidebarDrawer();

  const {
    user,
  } = useAuth();

  return (
    <div className="min-h-screen bg-surface font-sans text-ink dark:bg-structure dark:text-white">
      {/* SIDEBAR */}

      <Sidebar
        navItems={
          INSTRUCTOR_SIDEBAR_NAV
        }
        isOpen={
          drawer.isOpen
        }
        onClose={
          drawer.close
        }
        subtitle="Instructor workspace"
      />

      {/* HEADER */}

      <Navbar onMenuOpen={drawer.open} />

      {/* CONTENT */}

      <main className="pb-8 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
