import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

export default function PrivateRoute({
  children,
}) {
  const {
    isAuthenticated,
    user,
  } = useAuth();

  const location =
    useLocation();

  if (!isAuthenticated || !user) {
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

  return children;
}