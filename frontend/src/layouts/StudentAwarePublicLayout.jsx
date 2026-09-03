import { useAuth } from "@context/AuthContext";

import PublicLayout from "./PublicLayout";
import StudentLayout from "./StudentLayout";

export default function StudentAwarePublicLayout() {
  const { user, isAuthenticated } = useAuth();

  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!isAuthenticated || !user) {
    return <PublicLayout />;
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

  // =====================================================
  // STUDENT
  // RESEARCHER
  // ENTREPRENEUR / INNOVATOR
  //
  // These accounts use StudentLayout because
  // StudentLayout now selects navigation based on
  // both role and account_type.
  // =====================================================

  if (
    role === "student" ||
    accountType === "researcher" ||
    accountType === "entrepreneur" ||
    accountType === "innovator"
  ) {
    return <StudentLayout />;
  }

  // =====================================================
  // INSTRUCTOR / ADMIN
  //
  // They keep the public layout when visiting these
  // public ecosystem pages.
  // =====================================================






  
  return <PublicLayout />;
}