import { Outlet, Link } from "react-router-dom";

import {
  Menu,
  Bell,
} from "lucide-react";

import Sidebar from "@components/layout/Sidebar";
import LanguageSwitcher from "@components/ui/LanguageSwitcher";
import ThemeToggle from "@components/ui/ThemeToggle";

import {
  ADMIN_SIDEBAR_NAV,
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

export default function AdminLayout() {
  const drawer =
    useSidebarDrawer();

  const {
    unreadCount,
  } = useNotifications();

  const {
    user,
  } = useAuth();

  function getInitial() {
    if (!user) {
      return "U";
    }

    if (user.first_name) {
      return user.first_name[0].toUpperCase();
    }

    if (user.name) {
      return user.name[0].toUpperCase();
    }

    if (user.email) {
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
        navItems={ADMIN_SIDEBAR_NAV}
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        subtitle="Admin Portal"
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:pl-64">

        {/* MOBILE MENU */}

        <button
          type="button"
          className="rounded-lg p-2 hover:bg-slate-50 lg:hidden"
          aria-label="Open navigation"
          onClick={drawer.open}
        >
          <Menu size={20} />
        </button>

        {/* DESKTOP SPACER */}

        <div className="hidden lg:block" />

        {/* =================================================
            HEADER ACTIONS
        ================================================= */}

        <div className="flex items-center gap-3"><ThemeToggle /><LanguageSwitcher />

          {/* NOTIFICATIONS */}

          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-50"
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
          PAGE CONTENT
      ================================================= */}

      <main className="min-h-[calc(100vh-4rem)] pb-8 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}