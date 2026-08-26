import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "@context/AuthContext";

export default function RoleRoute({
  role,
  children,
}) {
  const {
    user,
    isAuthenticated,
  } = useAuth();

  const location =
    useLocation();

  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (
    !isAuthenticated ||
    !user
  ) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }

  // =====================================================
  // NORMALIZE ROLE
  // =====================================================

  const currentRole =
    String(
      user.role || ""
    )
      .trim()
      .toLowerCase();

  const requiredRole =
    String(
      role || ""
    )
      .trim()
      .toLowerCase();

  // =====================================================
  // ROLE MATCH
  // =====================================================

  if (
    currentRole ===
    requiredRole
  ) {
    return children;
  }

  // =====================================================
  // WRONG ROLE
  // DO NOT LOG OUT
  // =====================================================

  if (
    currentRole ===
    "admin"
  ) {
    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }

  if (
    currentRole ===
    "instructor"
  ) {
    return (
      <Navigate
        to="/instructor/dashboard"
        replace
      />
    );
  }

  if (
    currentRole ===
    "student"
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // =====================================================
  // UNKNOWN ROLE
  // =====================================================

  return (
    <Navigate
      to="/"
      replace
    />
  );
}