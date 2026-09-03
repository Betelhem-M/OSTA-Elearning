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
    loading,
  } = useAuth();

  const location = useLocation();


  // =====================================================
  // WAIT FOR AUTHENTICATION RESTORATION
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm text-gray-500">
            Loading your account...
          </p>
        </div>
      </div>
    );
  }


  // =====================================================
  // NOT AUTHENTICATED
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
          from: location.pathname,
        }}
      />
    );
  }


  // =====================================================
  // NORMALIZE ROLE
  // =====================================================

  const currentRole = String(
    user.role || ""
  )
    .trim()
    .toLowerCase();

  const requiredRole = String(
    role || ""
  )
    .trim()
    .toLowerCase();


  // =====================================================
  // CORRECT ROLE
  // =====================================================

  if (
    currentRole === requiredRole
  ) {
    return children;
  }


  // =====================================================
  // WRONG ROLE
  // =====================================================

  switch (currentRole) {

    case "admin":

      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      );


    case "instructor":

      return (
        <Navigate
          to="/instructor/dashboard"
          replace
        />
      );


    case "student":

      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );


    default:

      return (
        <Navigate
          to="/"
          replace
        />
      );
  }
}