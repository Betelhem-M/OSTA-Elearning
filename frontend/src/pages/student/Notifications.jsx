import { Link } from "react-router-dom";
import { Bell, Menu } from "lucide-react";

import NotificationCenter from "@components/notification/NotificationCenter";

import Sidebar from "@components/layout/Sidebar";
import BottomNav from "@components/layout/BottomNav";
import Navbar from "@components/layout/Navbar";

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

      <Navbar onMenuOpen={drawer.open} />

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