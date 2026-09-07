/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- Primary Color: BLUE ---
        // (Main buttons, navigation, links, active tabs, primary headings)
        // DEFAULT/hover/light are CSS-variable-backed (see src/styles/index.css)
        // so they automatically shift for dark mode; dark/darker/border stay
        // static since they're used for a handful of fixed-purpose spots.
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
          dark: '#1E40AF',    // blue-800
          darker: '#172554',  // blue-950
          border: '#BFDBFE',  // blue-200
        },

        // --- Accent Color: YELLOW ---
        // (Highlights, notifications, alerts - used with restraint)
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          hover: 'rgb(var(--color-accent-hover) / <alpha-value>)',
          light: 'rgb(var(--color-accent-light) / <alpha-value>)',
          dark: '#B45309',    // amber-700 (text readability on light backgrounds)
        },
        // Kept for backward compatibility if components use 'gold'
        gold: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          dark: '#B45309',
          light: 'rgb(var(--color-accent-light) / <alpha-value>)',
        },

        // --- Success Color: GREEN ---
        // (Success alerts, completed steps, approved badges, passing grades)
        success: {
          DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
          hover: 'rgb(var(--color-success-hover) / <alpha-value>)',
          light: 'rgb(var(--color-success-light) / <alpha-value>)',
          dark: '#047857',    // emerald-700
        },

        // --- Danger / Error (new — was ad-hoc red-500/600 before) ---
        danger: {
          DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
          hover: 'rgb(var(--color-danger-hover) / <alpha-value>)',
          light: 'rgb(var(--color-danger-light) / <alpha-value>)',
        },

        // --- Information (new) ---
        info: {
          DEFAULT: 'rgb(var(--color-info) / <alpha-value>)',
          hover: 'rgb(var(--color-info-hover) / <alpha-value>)',
          light: 'rgb(var(--color-info-light) / <alpha-value>)',
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
          DEFAULT: 'rgb(var(--color-text) / <alpha-value>)',
          soft: 'rgb(var(--color-text-soft) / <alpha-value>)',
          faint: 'rgb(var(--color-text-faint) / <alpha-value>)',
          white: '#FFFFFF',   // contrast text for dark structural headers
        },

        // --- Surface & Canvas Backgrounds ---
        surface: {
          DEFAULT: 'rgb(var(--color-bg) / <alpha-value>)',        // page background
          card: 'rgb(var(--color-surface) / <alpha-value>)',      // card/panel background
          muted: 'rgb(var(--color-surface-muted) / <alpha-value>)', // subtle recessed background
          elevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)', // modals/dropdowns/popovers
        },

        // --- Borders (new semantic token — was raw slate-200/300 before) ---
        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          muted: 'rgb(var(--color-border-muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}