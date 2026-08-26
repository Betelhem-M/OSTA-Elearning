import { Link } from "react-router-dom";
import { Bell, Menu } from "lucide-react";

import NotificationCenter from "@components/notification/NotificationCenter";

import Sidebar from "@components/layout/Sidebar";
import BottomNav from "@components/layout/BottomNav";

import {
  STUDENT_SIDEBAR_NAV,
  STUDENT_BOTTOM_NAV,
  INSTRUCTOR_SIDEBAR_NAV,
  ADMIN_SIDEBAR_NAV,
} from "@constants/navigation";

import { useSidebarDrawer } from "@hooks/useSidebarDrawer";
import { useNotifications } from "@context/NotificationContext";
import { useAuth } from "@context/AuthContext";

function getRoleInfo(user) {
  if (user?.role === "admin") {
    return {
      navigation: ADMIN_SIDEBAR_NAV,
      subtitle: "Admin Portal",
      showBottomNav: false,
    };
  }

  if (user?.role === "instructor") {
    return {
      navigation: INSTRUCTOR_SIDEBAR_NAV,
      subtitle: "Instructor workspace",
      showBottomNav: false,
    };
  }

  return {
    navigation: STUDENT_SIDEBAR_NAV,
    subtitle: "Learning Platform",
    showBottomNav: true,
  };
}

function getInitial(user) {
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

export default function Notifications() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const drawer = useSidebarDrawer();

  const roleInfo = getRoleInfo(user);

  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      {/* =================================================
          ROLE SIDEBAR
      ================================================= */}

      <Sidebar
        navItems={roleInfo.navigation}
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        subtitle={roleInfo.subtitle}
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

        {/* HEADER ACTIONS */}

        <div className="flex items-center gap-3">
          {/* NOTIFICATION ICON */}

          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative rounded-full p-2 text-primary transition hover:bg-primary-light"
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
            {getInitial(user)}
          </Link>
        </div>
      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main
        className={`min-h-[calc(100vh-4rem)] ${
          roleInfo.showBottomNav
            ? "pb-24"
            : "pb-8"
        } lg:pl-64`}
      >
        <div className="mx-auto max-w-6xl px-4 py-6">
          <NotificationCenter />
        </div>
      </main>

      {/* =================================================
          STUDENT BOTTOM NAV
      ================================================= */}

      {roleInfo.showBottomNav && (
        <BottomNav />
      )}
    </div>
  );
}