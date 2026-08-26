import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PublicLayout from "@layouts/PublicLayout";
import StudentLayout from "@layouts/StudentLayout";
import StudentAwarePublicLayout from "@layouts/StudentAwarePublicLayout";
import InstructorLayout from "@layouts/InstructorLayout";
import AdminLayout from "@layouts/AdminLayout";

import PrivateRoute from "./routes/PrivateRoute";
import RoleRoute from "./routes/RoleRoute";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Landing from "@pages/public/Landing";
import Marketplace from "@pages/public/Marketplace";
import CourseDetails from "@pages/public/CourseDetails";
import InnovationHub from "@pages/public/InnovationHub";
import ResearchPortal from "@pages/public/ResearchPortal";
import Competitions from "@pages/public/Competitions";
import EventsCalendar from "@pages/public/EventsCalendar";
import Discussion from "@pages/public/Discussion";

// =====================================================
// AUTH PAGES
// =====================================================

import Login from "@pages/auth/Login";
import Register from "@pages/auth/Register";
import ForgotPassword from "@pages/auth/ForgotPassword";

// =====================================================
// STUDENT PAGES
// =====================================================

import StudentDashboard from "@pages/student/Dashboard";
import MyLearning from "@pages/student/MyLearning";
import LessonPlayer from "@pages/student/LessonPlayer";
import Quiz from "@pages/student/Quiz";
import Assignment from "@pages/student/Assignment";
import Profile from "@pages/student/Profile";
import Notifications from "@pages/student/Notifications";
import Certificates from "@pages/student/Certificates";
import CertificateView from "@pages/student/CertificateView";
import Community from "@pages/student/Community";

// =====================================================
// INSTRUCTOR PAGES
// =====================================================

import InstructorDashboard from "@pages/instructor/Dashboard";
import MyCourses from "@pages/instructor/MyCourses";
import CreateCourse from "@pages/instructor/CreateCourse";
import InstructorAssignments from "@pages/instructor/Assignments";
import InstructorStudents from "@pages/instructor/Students";
import InstructorAnalytics from "@pages/instructor/Analytics";
import InstructorSettings from "@pages/instructor/Settings";

// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from "@pages/admin/Dashboard";
import AdminUsers from "@pages/admin/Users";
import AdminCourses from "@pages/admin/Courses";
import AdminReports from "@pages/admin/Reports";
import SystemHealth from "@pages/admin/SystemHealth";
import AdminSettings from "@pages/admin/Settings";

export default function App() {
  return (
    <Routes>

      {/* =================================================
          PUBLIC PAGES
      ================================================= */}

      <Route element={<PublicLayout />}>

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/competitions"
          element={<Competitions />}
        />

      </Route>

      {/* =================================================
          PUBLIC / STUDENT-AWARE ECOSYSTEM PAGES
          
          Guest:
            PublicLayout

          Student:
            StudentLayout

          Researcher:
            StudentLayout + researcher navigation

          Entrepreneur:
            StudentLayout + innovator navigation
      ================================================= */}

      <Route
        element={
          <StudentAwarePublicLayout />
        }
      >

        <Route
          path="/courses"
          element={<Marketplace />}
        />

        <Route
          path="/courses/:courseId"
          element={<CourseDetails />}
        />

        <Route
          path="/innovation-hub"
          element={<InnovationHub />}
        />

        <Route
          path="/research"
          element={<ResearchPortal />}
        />

        <Route
          path="/events"
          element={<EventsCalendar />}
        />

        <Route
          path="/discussion"
          element={<Discussion />}
        />

      </Route>

      {/* =================================================
          SHARED AUTHENTICATED PAGES
          
          Profile and notifications are intentionally
          outside StudentLayout. Their own pages select
          the correct role-specific navigation.
      ================================================= */}

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        }
      />

      {/* =================================================
          STUDENT / RESEARCHER / ENTREPRENEUR AREA
      ================================================= */}

      <Route
        element={
          <PrivateRoute>
            <StudentLayout />
          </PrivateRoute>
        }
      >

        <Route
          path="/dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/my-learning"
          element={<MyLearning />}
        />

        <Route
          path="/community"
          element={<Community />}
        />

        <Route
          path="/assignments"
          element={
            <Navigate
              to="/assignments/data-structures-assignment"
              replace
            />
          }
        />

        <Route
          path="/learn/:lessonId"
          element={<LessonPlayer />}
        />

        <Route
          path="/quiz/:quizId"
          element={<Quiz />}
        />

        <Route
          path="/assignments/:assignmentId"
          element={<Assignment />}
        />

        <Route
          path="/certificates"
          element={<Certificates />}
        />

        <Route
          path="/certificates/:certificateId"
          element={<CertificateView />}
        />

      </Route>

      {/* =================================================
          INSTRUCTOR AREA
      ================================================= */}

      <Route
        element={
          <RoleRoute role="instructor">
            <InstructorLayout />
          </RoleRoute>
        }
      >

        <Route
          path="/instructor/dashboard"
          element={<InstructorDashboard />}
        />

        <Route
          path="/instructor/courses"
          element={<MyCourses />}
        />

        <Route
          path="/instructor/courses/create"
          element={<CreateCourse />}
        />

        <Route
          path="/instructor/students"
          element={<InstructorStudents />}
        />

        <Route
          path="/instructor/analytics"
          element={<InstructorAnalytics />}
        />

        <Route
          path="/instructor/assignments"
          element={<InstructorAssignments />}
        />

        <Route
          path="/instructor/settings"
          element={<InstructorSettings />}
        />

      </Route>

      {/* =================================================
          ADMIN AREA
      ================================================= */}

      <Route
        element={
          <RoleRoute role="admin">
            <AdminLayout />
          </RoleRoute>
        }
      >

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        <Route
          path="/admin/courses"
          element={<AdminCourses />}
        />

        <Route
          path="/admin/reports"
          element={<AdminReports />}
        />

        <Route
          path="/admin/system"
          element={<SystemHealth />}
        />

        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />

      </Route>

      {/* =================================================
          FALLBACK
      ================================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}