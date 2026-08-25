import { useEffect, useState } from "react";

import { useAuth } from "@context/AuthContext";

import ContinueLearningCard from "@components/dashboard/ContinueLearningCard";
import CourseProgressList from "@components/dashboard/CourseProgressList";
import ActivityTimeline from "@components/dashboard/ActivityTimeline";
import AchievementGrid from "@components/dashboard/AchievementGrid";
import QuickActionsGrid from "@components/dashboard/QuickActionsGrid";
import PerformanceChart from "@components/dashboard/PerformanceChart";

import { apiRequest } from "@services/api";

export default function Dashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState({
    currentCourse: null,
    myCourses: [],
    upcomingDeadlines: [],
    weeklyActivity: [],
    achievements: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("osta_token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const data = await apiRequest(
        "/student/dashboard",
        {
          token,
        }
      );

      setDashboard({
        currentCourse:
          data?.currentCourse || null,

        myCourses:
          Array.isArray(data?.myCourses)
            ? data.myCourses
            : [],

        upcomingDeadlines:
          Array.isArray(
            data?.upcomingDeadlines
          )
            ? data.upcomingDeadlines
            : [],

        weeklyActivity:
          Array.isArray(
            data?.weeklyActivity
          )
            ? data.weeklyActivity
            : [],

        achievements:
          Array.isArray(
            data?.achievements
          )
            ? data.achievements
            : [],
      });
    } catch (err) {
      console.error(
        "Student dashboard error:",
        err
      );

      setError(
        err.message ||
          "Failed to load your dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // =====================================================
  // STUDENT NAME
  // =====================================================

  const studentName =
    user?.name ||
    `${user?.first_name || ""} ${
      user?.last_name || ""
    }`.trim();

  // =====================================================
  // QUICK ACTIONS
  // =====================================================

  const quickActions = [
    {
      label: "My Courses",
      href: "/courses",
      icon: "BookOpen",
    },

    {
      label: "Assignments",
      href: "/assignments",
      icon: "FileText",
    },

    {
      label: "Certificates",
      href: "/certificates",
      icon: "Award",
    },

    {
      // IMPORTANT:
      // This now opens the real student Community page,
      // not the old public mock Discussion page.
      label: "Community",
      href: "/community",
      icon: "MessageCircle",
    },
  ];

  // =====================================================
  // ACHIEVEMENT VIEW
  // =====================================================

  function handleViewAllAchievements() {
    return;
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink">
            Welcome back
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Loading your learning activity...
          </p>
        </div>

        <div className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <p className="text-sm text-slate-500">
            Loading student dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <h1 className="text-xl font-extrabold text-ink">
          Welcome back
          {studentName
            ? `, ${studentName}`
            : ""}{" "}
          👋
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your learning today.
        </p>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* =================================================
          CONTINUE LEARNING
      ================================================= */}

      {dashboard.currentCourse ? (
        <ContinueLearningCard
          course={
            dashboard.currentCourse
          }
        />
      ) : (
        <section className="rounded-2xl bg-white p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <p className="text-sm font-semibold text-slate-500">
            You are not enrolled in a course yet.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Explore the course catalog to start learning.
          </p>
        </section>
      )}

      {/* =================================================
          COURSES + ACTIVITY
      ================================================= */}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {/* MY COURSES */}

          <CourseProgressList
            courses={
              dashboard.myCourses
            }
          />

          {/* WEEKLY ACTIVITY */}

          <PerformanceChart
            data={
              dashboard.weeklyActivity
            }
            valueKey="lessons"
            labelKey="day"
            title="Weekly Learning Activity"
            valueLabel={(value) =>
              value === 1
                ? "lesson completed"
                : "lessons completed"
            }
          />
        </div>

        <div className="space-y-6">
          {/* DEADLINES */}

          <ActivityTimeline
            deadlines={
              dashboard.upcomingDeadlines
            }
          />

          {/* ACHIEVEMENTS */}

          <AchievementGrid
            achievements={
              dashboard.achievements
            }
            onViewAll={
              handleViewAllAchievements
            }
          />
        </div>
      </div>

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <QuickActionsGrid
        actions={quickActions}
      />
    </div>
  );
}