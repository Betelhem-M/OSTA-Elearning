/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- Primary Color: BLUE ---
        // (Main buttons, navigation, links, active tabs, primary headings)
        primary: {
          DEFAULT: '#1D4ED8', // blue-700
          dark: '#1E40AF',    // blue-800
          darker: '#172554',  // blue-950
          light: '#EFF6FF',   // blue-50 (subtle background/active tab)
          border: '#BFDBFE',  // blue-200
          hover: '#1E40AF',   // hover state
        },

        // --- Accent Color: YELLOW ---
        // (Highlights, notifications, alerts - used with restraint)
        accent: {
          DEFAULT: '#F59E0B', // amber-500
          dark: '#B45309',    // amber-700 (text readability on light backgrounds)
          light: '#FEF3C7',   // amber-100 (badge backgrounds)
          hover: '#D97706',   // amber-600
        },
        // Kept for backward compatibility if components use 'gold'
        gold: {
          DEFAULT: '#F59E0B',
          dark: '#B45309',
          light: '#FEF3C7',
        },

        // --- Success Color: GREEN ---
        // (Success alerts, completed steps, approved badges, passing grades)
        success: {
          DEFAULT: '#10B981', // emerald-500
          dark: '#047857',    // emerald-700
          light: '#D1FAE5',   // emerald-100
          hover: '#059669',   // emerald-600
        },

        // --- Structure / Dark Elements: BLACK & DEEP SLATE ---
        // (Sidebars, structural headers, dark surfaces, dark mode shells)
        structure: {
          DEFAULT: '#0F172A', // slate-900
          sidebar: '#0B0F19', // deep black sidebar
          surface: '#1E293B', // dark card background
          border: '#334155',  // dark border
        },

        // --- Text & Typography (Ink) ---
        ink: {
          DEFAULT: '#0F172A', // slate-900 (strong black text)
          soft: '#475569',    // slate-600 (body & description)
          faint: '#94A3B8',   // slate-400 (captions & placeholders)
          white: '#FFFFFF',   // contrast text for dark structural headers
        },

        // --- Surface & Canvas Backgrounds ---
        surface: {
          DEFAULT: '#F8FAFC', // slate-50 (page background)
          card: '#FFFFFF',    // pure white cards
          muted: '#F1F5F9',   // slate-100
        },
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}