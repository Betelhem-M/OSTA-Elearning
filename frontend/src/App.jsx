import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "@layouts/PublicLayout";
import StudentLayout from "@layouts/StudentLayout";
import InstructorLayout from "@layouts/InstructorLayout";
import AdminLayout from "@layouts/AdminLayout";
import PrivateRoute from "./routes/PrivateRoute";
import RoleRoute from "./routes/RoleRoute";

// Public pages
import Landing from "@pages/public/Landing";
import Marketplace from "@pages/public/Marketplace";
import CourseDetails from "@pages/public/CourseDetails";
import InnovationHub from "@pages/public/InnovationHub";
import ResearchPortal from "@pages/public/ResearchPortal";
import Competitions from "@pages/public/Competitions";
import EventsCalendar from "@pages/public/EventsCalendar";
import Discussion from "@pages/public/Discussion";

// Auth pages
import Login from "@pages/auth/Login";
import Register from "@pages/auth/Register";
import ForgotPassword from "@pages/auth/ForgotPassword";

// Student pages
import StudentDashboard from "@pages/student/Dashboard";
import LessonPlayer from "@pages/student/LessonPlayer";
import Quiz from "@pages/student/Quiz";
import Assignment from "@pages/student/Assignment";
import Certificate from "@pages/student/Certificate";
import Profile from "@pages/student/Profile";
import Notifications from "@pages/student/Notifications";

// Instructor pages
import InstructorDashboard from "@pages/instructor/Dashboard";

// Admin pages
import AdminDashboard from "@pages/admin/Dashboard";

export default function App() {
  return (
    <Routes>
      {/* Public, unauthenticated shell */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/courses" element={<Marketplace />} />
        <Route path="/courses/:courseId" element={<CourseDetails />} />
        <Route path="/innovation-hub" element={<InnovationHub />} />
        <Route path="/research" element={<ResearchPortal />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/events" element={<EventsCalendar />} />
        <Route path="/discussion" element={<Discussion />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Authenticated student shell */}
      <Route
        element={
          <PrivateRoute>
            <StudentLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<StudentDashboard />} />
        
        {/* Safety Net Fallback Redirects */}
        <Route path="/assignments" element={<Navigate to="/assignments/data-structures-assignment" replace />} />
        <Route path="/certificates" element={<Navigate to="/certificates/python-basics-cert" replace />} />
        
        {/* High-Fidelity Parameterized Core Views */}
        <Route path="/learn/:lessonId" element={<LessonPlayer />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
        <Route path="/assignments/:assignmentId" element={<Assignment />} />
        <Route path="/certificates/:certificateId" element={<Certificate />} />
        
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* Instructor shell */}
      <Route
        element={
          <RoleRoute role="instructor">
            <InstructorLayout />
          </RoleRoute>
        }
      >
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
      </Route>

      {/* Admin shell */}
      <Route
        element={
          <RoleRoute role="admin">
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
