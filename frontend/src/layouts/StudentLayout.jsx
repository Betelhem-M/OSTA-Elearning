import {
  Outlet,
  Link,
} from "react-router-dom";

import Sidebar from "@components/layout/Sidebar";
import Navbar from "@components/layout/Navbar";
import BottomNav from "@components/layout/BottomNav";

import {
  getAuthenticatedNavigation,
} from "@constants/navigation";

import {
  useSidebarDrawer,
} from "@hooks/useSidebarDrawer";

import {
  useAuth,
} from "@context/AuthContext";

export default function StudentLayout() {
  const drawer =
    useSidebarDrawer();

  const {
    user,
  } = useAuth();

  const navigation =
    getAuthenticatedNavigation(
      user
    );

  return (
    <div className="min-h-screen bg-surface font-sans text-ink">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar
        navItems={
          navigation.navigation
        }
        isOpen={
          drawer.isOpen
        }
        onClose={
          drawer.close
        }
        subtitle={
          navigation.subtitle
        }
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <Navbar onMenuOpen={drawer.open} />

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="pb-24 lg:pb-8 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* =================================================
          STUDENT BOTTOM NAV ONLY
      ================================================= */}

      {navigation.type ===
        "student" && (
        <BottomNav
          items={
            navigation.bottomNavigation
          }
        />
      )}
    </div>
  );
}