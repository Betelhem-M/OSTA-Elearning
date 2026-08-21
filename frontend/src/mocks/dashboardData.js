export const currentCourse = {
    id: 'python-for-beginners',
    title: 'Python Programming for Beginners',
    lesson: 'Variables and Data Types',
    progress: 65,
    timeLeft: '18 min left in this lesson',
}

export const myCourses = [
    {
        id: 'python-data-science',
        title: 'Python for Data Science',
        instructor: 'Dr. Abebe Girma',
        progress: 40,
        thumbnailColor: '#2E7D32',
    },
    {
        id: 'research-methods',
        title: 'Research Methods & Innovation',
        instructor: 'Prof. Tigist Haile',
        progress: 15,
        thumbnailColor: '#F9A825',
    },
    {
        id: 'data-structures',
        title: 'Data Structures & Algorithms',
        instructor: 'Eng. Dawit Tesfaye',
        progress: 72,
        thumbnailColor: '#1A3C2B',
    },
]

export const upcomingDeadlines = [
    { id: 1, title: 'Python Basics Quiz', course: 'Python Programming', dueLabel: 'Due today, 11:59 PM', urgent: true },
    { id: 2, title: 'Data Structures Assignment', course: 'Data Structures & Algorithms', dueLabel: 'Due in 2 days', urgent: false },
    { id: 3, title: 'Research Proposal Draft', course: 'Research Methods & Innovation', dueLabel: 'Due in 5 days', urgent: false },
]

export const achievements = [
    { id: 1, label: 'First Course Completed', icon: 'Trophy', earned: true },
    { id: 2, label: '7-Day Streak', icon: 'Flame', earned: true },
    { id: 3, label: 'Quiz Master', icon: 'Sparkles', earned: true },
    { id: 4, label: 'Top 10% Learner', icon: 'Star', earned: false },
]

export const quickActions = [
    { label: 'My Courses', href: '/courses', icon: 'BookOpen' },
    { label: 'Assignments', href: '/assignments', icon: 'FileText' },
    { label: 'Certificates', href: '/certificates', icon: 'Award' },
    { label: 'Community', href: '/discussion', icon: 'MessageCircle' },
]

export const weeklyActivity = [
    { day: 'Mon', minutes: 25 },
    { day: 'Tue', minutes: 40 },
    { day: 'Wed', minutes: 15 },
    { day: 'Thu', minutes: 55 },
    { day: 'Fri', minutes: 30 },
    { day: 'Sat', minutes: 10 },
    { day: 'Sun', minutes: 45 },
]