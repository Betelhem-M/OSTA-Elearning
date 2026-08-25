import { useAuth } from "@context/AuthContext";
import PublicLayout from "./PublicLayout";
import StudentLayout from "./StudentLayout";

export default function StudentAwarePublicLayout() {
  const { user } = useAuth();

  if (user?.role === "student") {
    return <StudentLayout />;
  }

  return <PublicLayout />;
}