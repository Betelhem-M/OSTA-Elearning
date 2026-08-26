import {
  Outlet,
  Link,
} from "react-router-dom";

import {
  Menu,
  Bell,
} from "lucide-react";

import Sidebar from "@components/layout/Sidebar";
import BottomNav from "@components/layout/BottomNav";

import {
  getAuthenticatedNavigation,
} from "@constants/navigation";

import {
  useSidebarDrawer,
} from "@hooks/useSidebarDrawer";

import {
  useNotifications,
} from "@context/NotificationContext";

import {
  useAuth,
} from "@context/AuthContext";

export default function StudentLayout() {
  const drawer =
    useSidebarDrawer();

  const {
    unreadCount,
  } = useNotifications();

  const {
    user,
  } = useAuth();

  const navigation =
    getAuthenticatedNavigation(
      user
    );

  function getInitial() {
    if (user?.first_name) {
      return user.first_name[0].toUpperCase();
    }

    if (user?.name) {
      return user.name[0].toUpperCase();
    }

    if (user?.email) {
      return user.email[0].toUpperCase();
    }

    return "U";
  }

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

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:pl-64">

        {/* MOBILE MENU */}

        <button
          type="button"
          className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
          onClick={
            drawer.open
          }
        >
          <Menu size={20} />
        </button>

        <div className="hidden lg:block" />

        {/* HEADER ACTIONS */}

        <div className="flex items-center gap-3">

          {/* NOTIFICATIONS */}

          <Link
            to="/notifications"
            className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-50"
            aria-label="Notifications"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* PROFILE */}

          <Link
            to="/profile"
            aria-label="Your profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-black uppercase text-primary transition hover:ring-2 hover:ring-primary/20"
          >
            {getInitial()}
          </Link>
        </div>
      </header>

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