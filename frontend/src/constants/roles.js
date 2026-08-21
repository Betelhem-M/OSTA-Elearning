export const ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
}

export function getDashboardPath(role) {
  switch (role) {
    case ROLES.INSTRUCTOR:
      return '/instructor/dashboard'
    case ROLES.ADMIN:
      return '/admin/dashboard'
    default:
      return '/dashboard'
  }
}