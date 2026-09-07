import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'osta_theme'
const ThemeContext = createContext(null)

function getSystemPrefersDark() {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Only 'light' or 'dark' are ever accepted — anything else (corrupted value,
// a leftover key from an older build, manual tampering) is treated as "no
// preference saved yet" rather than crashing or defaulting to light.
function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'dark' || stored === 'light' ? stored : null
  } catch {
    return null
  }
}

export function ThemeProvider({ children }) {
  const [explicitTheme, setExplicitTheme] = useState(readStoredTheme)
  const [isDark, setIsDark] = useState(() => (explicitTheme ? explicitTheme === 'dark' : getSystemPrefersDark()))

  // Follow the OS-level light/dark setting live, but only for as long as the
  // user hasn't made an explicit choice in-app. The moment they toggle,
  // their choice takes over and this stops reacting to OS changes.
  useEffect(() => {
    if (explicitTheme || typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => setIsDark(e.matches)
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [explicitTheme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const setTheme = useCallback((theme) => {
    setIsDark(theme === 'dark')
    setExplicitTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Storage unavailable (private browsing, quota, etc.) — theme still
      // applies for this session, it just won't survive a refresh.
    }
  }, [])

  const toggleTheme = useCallback(() => setTheme(isDark ? 'light' : 'dark'), [isDark, setTheme])

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        theme: isDark ? 'dark' : 'light',
        toggleTheme,
        setTheme,
        setDark: (value) => setTheme(value ? 'dark' : 'light'), // kept for backward compatibility
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}