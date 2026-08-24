import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "@layouts/PublicLayout";
import StudentLayout from "@layouts/StudentLayout";
import InstructorLayout from "@layouts/InstructorLayout";
import AdminLayout from "@layouts/AdminLayout";

import PrivateRoute from "./routes/PrivateRoute";
import RoleRoute from "./routes/RoleRoute";

// =========================
// PUBLIC PAGES
// =========================

import Landing from "@pages/public/Landing";
import Marketplace from "@pages/public/Marketplace";
import CourseDetails from "@pages/public/CourseDetails";
import InnovationHub from "@pages/public/InnovationHub";
import ResearchPortal from "@pages/public/ResearchPortal";
import Competitions from "@pages/public/Competitions";
import EventsCalendar from "@pages/public/EventsCalendar";
import Discussion from "@pages/public/Discussion";

// =========================
// AUTH PAGES
// =========================

import Login from "@pages/auth/Login";
import Register from "@pages/auth/Register";
import ForgotPassword from "@pages/auth/ForgotPassword";

// =========================
// STUDENT PAGES
// =========================

import StudentDashboard from "@pages/student/Dashboard";
import LessonPlayer from "@pages/student/LessonPlayer";
import Quiz from "@pages/student/Quiz";
import Assignment from "@pages/student/Assignment";
import Certificate from "@pages/student/Certificate";
import Profile from "@pages/student/Profile";
import Notifications from "@pages/student/Notifications";

// =========================
// INSTRUCTOR PAGES
// =========================

import InstructorDashboard from "@pages/instructor/Dashboard";
import MyCourses from "@pages/instructor/MyCourses";
import CreateCourse from "@pages/instructor/CreateCourse";
import InstructorAssignments from "@pages/instructor/Assignments";
import InstructorStudents from "@pages/instructor/Students";
import InstructorAnalytics from "@pages/instructor/Analytics";
import InstructorSettings from "@pages/instructor/Settings";

// =========================
// ADMIN PAGES
// =========================

import AdminDashboard from "@pages/admin/Dashboard";
import AdminUsers from "@pages/admin/Users";
import AdminCourses from "@pages/admin/Courses";
import AdminReports from "@pages/admin/Reports";
import SystemHealth from "@pages/admin/SystemHealth";
import AdminSettings from "@pages/admin/Settings";

export default function App() {
  return (
    <Routes>

      {/* =========================
          PUBLIC LAYOUT
      ========================= */}

      <Route element={<PublicLayout />}>

        <Route
          path="/"
          element={<Landing />}
        />

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
          path="/competitions"
          element={<Competitions />}
        />

        <Route
          path="/events"
          element={<EventsCalendar />}
        />

        <Route
          path="/discussion"
          element={<Discussion />}
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

      </Route>

      {/* =========================
          STUDENT LAYOUT
      ========================= */}

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
          path="/assignments"
          element={
            <Navigate
              to="/assignments/data-structures-assignment"
              replace
            />
          }
        />

        <Route
          path="/certificates"
          element={
            <Navigate
              to="/certificates/python-basics-cert"
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
          path="/certificates/:certificateId"
          element={<Certificate />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

      </Route>

      {/* =========================
          INSTRUCTOR LAYOUT
      ========================= */}

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

      {/* =========================
          ADMIN LAYOUT
      ========================= */}

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
          path="/admin/settings"
          element={<AdminSettings />}
        />

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />
        <Route
          path="/admin/system"
          element={<SystemHealth />}
        />

        <Route
          path="/admin/courses"
          element={<AdminCourses />}
        />

        <Route
          path="/admin/reports"
          element={<AdminReports />}
        />

      </Route>

    </Routes>
  );
}