const DASHBOARD_PATHS = {
  student: "/dashboard",
  instructor: "/instructor/dashboard",
  admin: "/admin/dashboard",
  researcher: "/research",
  entrepreneur: "/innovation-hub",
};

export function getDashboardPath(role, accountType) {
  const normalizedRole = String(
    role || ""
  )
    .trim()
    .toLowerCase();

  const normalizedAccountType = String(
    accountType || ""
  )
    .trim()
    .toLowerCase();

  // =====================================================
  // ADMIN
  // =====================================================

  if (
    normalizedRole === "admin"
  ) {
    return DASHBOARD_PATHS.admin;
  }

  // =====================================================
  // INSTRUCTOR
  // =====================================================

  if (
    normalizedRole === "instructor"
  ) {
    return DASHBOARD_PATHS.instructor;
  }

  // =====================================================
  // RESEARCHER
  // =====================================================

  if (
    normalizedAccountType === "researcher"
  ) {
    return DASHBOARD_PATHS.researcher;
  }

  // =====================================================
  // ENTREPRENEUR / INNOVATOR
  // =====================================================

  if (
    normalizedAccountType === "entrepreneur" ||
    normalizedAccountType === "innovator"
  ) {
    return DASHBOARD_PATHS.entrepreneur;
  }

  // =====================================================
  // STUDENT
  // =====================================================

  if (
    normalizedRole === "student" ||
    normalizedAccountType === "student"
  ) {
    return DASHBOARD_PATHS.student;
  }

  // =====================================================
  // FALLBACK
  // =====================================================

  return "/";
}

export default DASHBOARD_PATHS;