export const adminStats = [
    { icon: 'Users', label: 'Total Users', value: '4,821', trend: '+128 this month' },
    { icon: 'BookOpen', label: 'Total Courses', value: '62', trend: '+3 this month' },
    { icon: 'AlertTriangle', label: 'Flagged Content', value: '3', trend: null, trendPositive: false },
    { icon: 'Activity', label: 'System Uptime', value: '99.98%', trend: null },
]

export const users = [
    { id: 1, name: 'Hana Bekele', email: 'hana.bekele@example.com', role: 'Student', status: 'Active' },
    { id: 2, name: 'Dr. Tadesse Worku', email: 't.worku@example.com', role: 'Instructor', status: 'Active' },
    { id: 3, name: 'Mulugeta Girma', email: 'm.girma@example.com', role: 'Student', status: 'Suspended' },
    { id: 4, name: 'Aster Kebede', email: 'aster.k@example.com', role: 'Admin', status: 'Active' },
    { id: 5, name: 'Dawit Alemu', email: 'dawit.alemu@example.com', role: 'Student', status: 'Active' },
]

export const moderationQueue = [
    { id: 1, type: 'Discussion post', reportedBy: '3 users', excerpt: 'Off-topic promotional content in the AI course discussion...' },
    { id: 2, type: 'Course review', reportedBy: '1 user', excerpt: 'Review contains language flagged by automated filter...' },
    { id: 3, type: 'Profile bio', reportedBy: '2 users', excerpt: 'Bio contains an external link flagged as spam...' },
]