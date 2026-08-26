export const PUBLIC_NAV = [
  {
    label: "Courses",
    href: "/courses",
  },
  {
    label: "Innovation Hub",
    href: "/innovation-hub",
  },
  {
    label: "Research",
    href: "/research",
  },
  {
    label: "Competitions",
    href: "/competitions",
  },
  {
    label: "Events",
    href: "/events",
  },
  {
    label: "Community",
    href: "/discussion",
  },
];

// =====================================================
// STUDENT
// =====================================================

export const STUDENT_BOTTOM_NAV = [
  {
    label: "Home",
    href: "/dashboard",
    icon: "Home",
  },
  {
    label: "Explore",
    href: "/courses",
    icon: "Compass",
  },
  {
    label: "My Learning",
    href: "/my-learning",
    icon: "GraduationCap",
  },
  {
    label: "Community",
    href: "/community",
    icon: "MessageCircle",
  },
  {
    label: "Profile",
    href: "/profile",
    icon: "User",
  },
];

export const STUDENT_SIDEBAR_NAV = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    label: "My Courses",
    href: "/courses",
    icon: "BookOpen",
  },
  {
    label: "Assignments",
    href: "/assignments",
    icon: "FileText",
  },
  {
    label: "Certificates",
    href: "/certificates",
    icon: "Award",
  },
  {
    label: "Community",
    href: "/community",
    icon: "MessageCircle",
  },
  {
    label: "Profile",
    href: "/profile",
    icon: "User",
  },
];

// =====================================================
// RESEARCHER
// =====================================================

export const RESEARCHER_SIDEBAR_NAV = [
  {
    label: "Research",
    href: "/research",
    icon: "FlaskConical",
  },
  {
    label: "Innovation Hub",
    href: "/innovation-hub",
    icon: "Lightbulb",
  },
  {
    label: "Courses",
    href: "/courses",
    icon: "BookOpen",
  },
  {
    label: "Community",
    href: "/discussion",
    icon: "MessageCircle",
  },
  {
    label: "Events",
    href: "/events",
    icon: "CalendarDays",
  },
  {
    label: "Competitions",
    href: "/competitions",
    icon: "Trophy",
  },
  {
    label: "Profile",
    href: "/profile",
    icon: "User",
  },
];

// =====================================================
// INNOVATOR / ENTREPRENEUR
// =====================================================

export const INNOVATOR_SIDEBAR_NAV = [
  {
    label: "Innovation Hub",
    href: "/innovation-hub",
    icon: "Lightbulb",
  },
  {
    label: "Research",
    href: "/research",
    icon: "FlaskConical",
  },
  {
    label: "Courses",
    href: "/courses",
    icon: "BookOpen",
  },
  {
    label: "Community",
    href: "/discussion",
    icon: "MessageCircle",
  },
  {
    label: "Events",
    href: "/events",
    icon: "CalendarDays",
  },
  {
    label: "Competitions",
    href: "/competitions",
    icon: "Trophy",
  },
  {
    label: "Profile",
    href: "/profile",
    icon: "User",
  },
];

// =====================================================
// INSTRUCTOR
// =====================================================

export const INSTRUCTOR_SIDEBAR_NAV = [
  {
    label: "Overview",
    href: "/instructor/dashboard",
    icon: "LayoutDashboard",
  },
  {
    label: "My Courses",
    href: "/instructor/courses",
    icon: "BookOpen",
  },
  {
    label: "Students",
    href: "/instructor/students",
    icon: "Users",
  },
  {
    label: "Analytics",
    href: "/instructor/analytics",
    icon: "BarChart3",
  },
  {
    label: "Assignments",
    href: "/instructor/assignments",
    icon: "FileText",
  },
  {
    label: "Profile",
    href: "/profile",
    icon: "User",
  },
  {
    label: "Settings",
    href: "/instructor/settings",
    icon: "Settings",
  },
];

// =====================================================
// ADMIN
// =====================================================

export const ADMIN_SIDEBAR_NAV = [
  {
    label: "Overview",
    href: "/admin/dashboard",
    icon: "LayoutDashboard",
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: "Users",
  },
  {
    label: "Course Catalog",
    href: "/admin/courses",
    icon: "BookOpen",
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: "FileBarChart",
  },
  {
    label: "System Health",
    href: "/admin/system",
    icon: "Activity",
  },
  {
    label: "Profile",
    href: "/profile",
    icon: "User",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "Settings",
  },
];

// =====================================================
// GET AUTHENTICATED NAVIGATION
// =====================================================

export function getAuthenticatedNavigation(user) {
  if (!user) {
    return {
      type: "guest",
      navigation: [],
      bottomNavigation: [],
      subtitle: "Learning Platform",
    };
  }

  const role = String(
    user.role || ""
  )
    .trim()
    .toLowerCase();

  const accountType = String(
    user.account_type || ""
  )
    .trim()
    .toLowerCase();

  // -----------------------------------------------------
  // ADMIN HAS HIGHEST PRIORITY
  // -----------------------------------------------------

  if (role === "admin") {
    return {
      type: "admin",
      navigation: ADMIN_SIDEBAR_NAV,
      bottomNavigation: [],
      subtitle: "Admin Portal",
    };
  }

  // -----------------------------------------------------
  // INSTRUCTOR
  // -----------------------------------------------------

  if (role === "instructor") {
    return {
      type: "instructor",
      navigation: INSTRUCTOR_SIDEBAR_NAV,
      bottomNavigation: [],
      subtitle: "Instructor Workspace",
    };
  }

  // -----------------------------------------------------
  // RESEARCHER
  // -----------------------------------------------------

  if (accountType === "researcher") {
    return {
      type: "researcher",
      navigation: RESEARCHER_SIDEBAR_NAV,
      bottomNavigation: [],
      subtitle: "Researcher Workspace",
    };
  }

  // -----------------------------------------------------
  // ENTREPRENEUR / INNOVATOR
  // -----------------------------------------------------

  if (
    accountType === "entrepreneur" ||
    accountType === "innovator"
  ) {
    return {
      type: "innovator",
      navigation: INNOVATOR_SIDEBAR_NAV,
      bottomNavigation: [],
      subtitle: "Innovation Workspace",
    };
  }

  // -----------------------------------------------------
  // NORMAL STUDENT
  // -----------------------------------------------------

  return {
    type: "student",
    navigation: STUDENT_SIDEBAR_NAV,
    bottomNavigation: STUDENT_BOTTOM_NAV,
    subtitle: "Learning Platform",
  };
}

// =====================================================
// GET DEFAULT DESTINATION
// =====================================================

export function getRoleHomePath(user) {
  if (!user) {
    return "/";
  }

  const role = String(
    user.role || ""
  )
    .trim()
    .toLowerCase();

  const accountType = String(
    user.account_type || ""
  )
    .trim()
    .toLowerCase();

  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "instructor") {
    return "/instructor/dashboard";
  }

  if (accountType === "researcher") {
    return "/research";
  }

  if (
    accountType === "entrepreneur" ||
    accountType === "innovator"
  ) {
    return "/innovation-hub";
  }

  return "/dashboard";
}