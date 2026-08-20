import { useAuth } from '@context/AuthContext'
import ContinueLearningCard from '@components/dashboard/ContinueLearningCard'
import CourseProgressList from '@components/dashboard/CourseProgressList'
import ActivityTimeline from '@components/dashboard/ActivityTimeline'
import AchievementGrid from '@components/dashboard/AchievementGrid'
import QuickActionsGrid from '@components/dashboard/QuickActionsGrid'
import PerformanceChart from '@components/dashboard/PerformanceChart'
import {
  currentCourse,
  myCourses,
  upcomingDeadlines,
  achievements,
  quickActions,
  weeklyActivity,
} from '@mocks/dashboardData'

export default function Dashboard() {
  const { user } = useAuth()

  function handleViewAllAchievements() {
    alert('Only the badges shown here exist in this build — there are no additional achievements yet.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-ink">
          Welcome back{user?.name ? `, ${user.name}` : ''} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here's what's happening with your learning today.</p>
      </div>

      <ContinueLearningCard course={currentCourse} />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <CourseProgressList courses={myCourses} />
          <PerformanceChart data={weeklyActivity} />
        </div>
        <div className="space-y-6">
          <ActivityTimeline deadlines={upcomingDeadlines} />
          <AchievementGrid achievements={achievements} onViewAll={handleViewAllAchievements} />
        </div>
      </div>

      <QuickActionsGrid actions={quickActions} />
    </div>
  )
}