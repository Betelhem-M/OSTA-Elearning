import { Routes, Route, Navigate } from 'react-router-dom';

// -----------------------------------------------------------------------------
// Layouts
// -----------------------------------------------------------------------------
import PublicLayout from '@layouts/PublicLayout';
import StudentLayout from '@layouts/StudentLayout';
import StudentAwarePublicLayout from '@layouts/StudentAwarePublicLayout';
import InstructorLayout from '@layouts/InstructorLayout';
import AdminLayout from '@layouts/AdminLayout';

// -----------------------------------------------------------------------------
// Route Guards
// -----------------------------------------------------------------------------
import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';
import AccountTypeRoute from './routes/AccountTypeRoute';

// -----------------------------------------------------------------------------
// Public Pages
// -----------------------------------------------------------------------------
import Landing from '@pages/public/Landing';
import Marketplace from '@pages/public/Marketplace';
import CourseDetails from '@pages/public/CourseDetails';
import InnovationHub from '@pages/public/InnovationHub';
import ResearchPortal from '@pages/public/ResearchPortal';
import Competitions from '@pages/public/Competitions';
import EventsCalendar from '@pages/public/EventsCalendar';
import Discussion from '@pages/public/Discussion';
import Search from '@pages/public/Search';

// -----------------------------------------------------------------------------
// Authentication Pages
// -----------------------------------------------------------------------------
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import ForgotPassword from '@pages/auth/ForgotPassword';
import VerifyEmail from '@pages/auth/VerifyEmail';

// -----------------------------------------------------------------------------
// Student Pages
// -----------------------------------------------------------------------------
import StudentDashboard from '@pages/student/Dashboard';
import MyLearning from '@pages/student/MyLearning';
import LessonPlayer from '@pages/student/LessonPlayer';
import Quiz from '@pages/student/Quiz';
import Assignment from '@pages/student/Assignment';
import Assignments from '@pages/student/Assignments';
import Profile from '@pages/student/Profile';
import Notifications from '@pages/student/Notifications';
import Certificates from '@pages/student/Certificates';
import CertificateView from '@pages/student/CertificateView';
import Community from '@pages/student/Community';
import Progress from '@pages/student/Progress';
import TakeQuiz from '@pages/student/TakeQuiz';
import Bookmarks from '@pages/student/Bookmarks';

// -----------------------------------------------------------------------------
// Instructor Pages
// -----------------------------------------------------------------------------
import InstructorDashboard from '@pages/instructor/Dashboard';
import MyCourses from '@pages/instructor/MyCourses';
import CreateCourse from '@pages/instructor/CreateCourse';
import InstructorAssignments from '@pages/instructor/Assignments';
import InstructorStudents from '@pages/instructor/Students';
import InstructorAnalytics from '@pages/instructor/Analytics';
import InstructorSettings from '@pages/instructor/Settings';
import StudentProgress from '@pages/instructor/StudentProgress';
import QuizBuilder from '@pages/instructor/QuizBuilder';
import CreateEvent from '@pages/instructor/CreateEvent';
import CourseWorkspace from '@pages/instructor/CourseWorkspace';
import AssignmentEvaluation from '@pages/instructor/AssignmentEvaluation';

// -----------------------------------------------------------------------------
// Admin Pages
// -----------------------------------------------------------------------------
import AdminDashboard from '@pages/admin/Dashboard';
import AdminUsers from '@pages/admin/Users';
import AdminCourses from '@pages/admin/Courses';
import AdminCompetitions from '@pages/admin/Competitions';
import AdminReports from '@pages/admin/Reports';
import SystemHealth from '@pages/admin/SystemHealth';
import AdminSettings from '@pages/admin/Settings';
import EventManagement from '@pages/admin/EventManagement';
import AdminCreateEvent from '@pages/admin/AdminCreateEvent';

// -----------------------------------------------------------------------------
// Other Account Types
// -----------------------------------------------------------------------------
import ResearcherDashboard from '@pages/researcher/ResearcherDashboard';
import EntrepreneurDashboard from '@pages/entrepreneur/EntrepreneurDashboard';

// -----------------------------------------------------------------------------
// Shared Pages
// -----------------------------------------------------------------------------
import PrivateQuestions from '@pages/PrivateQuestions';

// =============================================================================
// APP
// =============================================================================

export default function App() {
  return (
    <Routes>

      {/* =======================================================================
          PUBLIC ROUTES
      ======================================================================= */}

      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>


      {/* =======================================================================
          PUBLIC / STUDENT-AWARE ROUTES
      ======================================================================= */}

      <Route element={<StudentAwarePublicLayout />}>
        <Route path="/courses" element={<Marketplace />} />
        <Route path="/courses/:courseId" element={<CourseDetails />} />

        <Route path="/innovation-hub" element={<InnovationHub />} />
        <Route path="/research" element={<ResearchPortal />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/events" element={<EventsCalendar />} />
        <Route path="/discussion" element={<Discussion />} />
        <Route path="/search" element={<Search />} />
      </Route>


      {/* =======================================================================
          STUDENT ROUTES
      ======================================================================= */}

      <Route
        element={
          <RoleRoute role="student">
            <StudentLayout />
          </RoleRoute>
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
          path="/progress"
          element={<Progress />}
        />

        <Route
          path="/community"
          element={<Community />}
        />

        <Route
          path="/bookmarks"
          element={<Bookmarks />}
        />

        <Route
          path="/questions"
          element={<PrivateQuestions />}
        />

        {/* Student assignment list */}
        <Route
          path="/assignments"
          element={<Assignments />}
        />

        {/* Individual assignment */}
        <Route
          path="/assignments/:assignmentId"
          element={<Assignment />}
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
          path="/take-quiz/:quizId"
          element={<TakeQuiz />}
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


      {/* =======================================================================
          RESEARCHER ROUTES
      ======================================================================= */}

      <Route
        element={
          <AccountTypeRoute accountType="researcher">
            <StudentLayout />
          </AccountTypeRoute>
        }
      >
        <Route
          path="/researcher/dashboard"
          element={<ResearcherDashboard />}
        />
      </Route>


      {/* =======================================================================
          ENTREPRENEUR ROUTES
      ======================================================================= */}

      <Route
        element={
          <AccountTypeRoute accountType="entrepreneur">
            <StudentLayout />
          </AccountTypeRoute>
        }
      >
        <Route
          path="/entrepreneur/dashboard"
          element={<EntrepreneurDashboard />}
        />
      </Route>


      {/* =======================================================================
          SHARED PRIVATE ROUTES
      ======================================================================= */}

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


      {/* =======================================================================
          INSTRUCTOR ROUTES
      ======================================================================= */}

      <Route
        element={
          <RoleRoute role="instructor">
            <InstructorLayout />
          </RoleRoute>
        }
      >

        {/* Dashboard */}
        <Route
          path="/instructor/dashboard"
          element={<InstructorDashboard />}
        />

        {/* Courses */}
        <Route
          path="/instructor/courses"
          element={<MyCourses />}
        />

        <Route
          path="/instructor/courses/create"
          element={<CreateCourse />}
        />

        <Route
          path="/instructor/courses/:courseId"
          element={<CourseWorkspace />}
        />

        {/* Quizzes */}
        <Route
          path="/instructor/quizzes/create"
          element={<QuizBuilder />}
        />

        <Route
          path="/instructor/quizzes/:quizId/edit"
          element={<QuizBuilder />}
        />

        {/* Students */}
        <Route
          path="/instructor/students"
          element={<InstructorStudents />}
        />

        <Route
          path="/instructor/students/:studentId/progress"
          element={<StudentProgress />}
        />

        {/* Analytics */}
        <Route
          path="/instructor/analytics"
          element={<InstructorAnalytics />}
        />

        {/* Assignments */}
        <Route
          path="/instructor/assignments"
          element={<InstructorAssignments />}
        />

        {/* Assignment Evaluation */}
        <Route
          path="/instructor/assignments/review"
          element={<AssignmentEvaluation />}
        />

        {/* Private Questions */}
        <Route
          path="/instructor/questions"
          element={<PrivateQuestions />}
        />

        {/* Events */}
        <Route
          path="/instructor/events/create"
          element={<CreateEvent />}
        />

        <Route
          path="/instructor/events"
          element={<EventManagement />}
        />

        <Route
          path="/instructor/events/:id/edit"
          element={<CreateEvent />}
        />

        {/* Competitions */}
        <Route
          path="/instructor/competitions"
          element={<Competitions />}
        />

        {/* Settings */}
        <Route
          path="/instructor/settings"
          element={<InstructorSettings />}
        />
      </Route>


      {/* =======================================================================
          ADMIN ROUTES
      ======================================================================= */}

      <Route
        element={
          <RoleRoute role="admin">
            <AdminLayout />
          </RoleRoute>
        }
      >

        {/* Dashboard */}
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* Users */}
        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        {/* Courses */}
        <Route
          path="/admin/courses"
          element={<AdminCourses />}
        />

        {/* Competitions */}
        <Route
          path="/admin/competitions"
          element={<AdminCompetitions />}
        />

        {/* Events */}
        <Route
          path="/admin/events"
          element={<EventManagement />}
        />

        <Route
          path="/admin/events/create"
          element={<AdminCreateEvent />}
        />

        <Route
          path="/admin/events/:id/edit"
          element={<AdminCreateEvent />}
        />

        {/* Reports */}
        <Route
          path="/admin/reports"
          element={<AdminReports />}
        />

        {/* System */}
        <Route
          path="/admin/system"
          element={<SystemHealth />}
        />

        {/* Settings */}
        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />
      </Route>


      {/* =======================================================================
          404 FALLBACK
      ======================================================================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}