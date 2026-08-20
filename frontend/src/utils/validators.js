export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const phonePattern = /^[+\d][\d\s-]{7,}$/

export function validateEmail(value) {
  if (!value.trim()) return 'Enter your email address.'
  if (!emailPattern.test(value.trim())) return 'Enter a valid email address.'
  return ''
}

export function validatePhone(value) {
  if (!value.trim()) return 'Enter your phone number.'
  if (!phonePattern.test(value.trim())) return 'Enter a valid phone number.'
  return ''
}

export function validateRequired(value, message) {
  return value?.toString().trim() ? '' : message
}

export function validatePassword(value, minLength = 6) {
  if (!value) return 'Create a password.'
  if (value.length < minLength) return `Password must be at least ${minLength} characters.`
  return ''
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Confirm your password.'
  if (confirmPassword !== password) return 'Passwords do not match.'
  return ''
}

// Score 0–5, same logic as the vanilla register.js meter
export function getPasswordStrength(value) {
  let score = 0
  if (value.length >= 6) score += 1
  if (value.length >= 10) score += 1
  if (/[A-Z]/.test(value)) score += 1
  if (/[0-9]/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1

  const levels = [
    { max: 0, width: '0%', label: 'Weak', color: 'bg-red-600' },
    { max: 2, width: '33%', label: 'Weak', color: 'bg-red-600' },
    { max: 3, width: '55%', label: 'Fair', color: 'bg-gold' },
    { max: 4, width: '78%', label: 'Good', color: 'bg-lime-600' },
    { max: 5, width: '100%', label: 'Strong', color: 'bg-primary' },
  ]

  return levels.find((l) => score <= l.max) || levels[levels.length - 1]
}