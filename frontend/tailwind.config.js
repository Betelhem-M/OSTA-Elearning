/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e3a8a',
          900: '#102a43',
          950: '#081827',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          darker: 'var(--primary-darker)',
          light: 'var(--primary-light)',
          border: 'var(--primary-border)',
          hover: 'var(--primary-hover)',
        },
        accent: {
          DEFAULT: '#facc15',
          dark: '#d4a30d',
          light: '#fef3c7',
          hover: '#fbbf24',
        },
        gold: {
          DEFAULT: '#facc15',
          dark: '#d4a30d',
          light: '#fef3c7',
        },
        success: {
          DEFAULT: '#1d4ed8',
          dark: '#1e3a8a',
          light: '#edf3ff',
          hover: '#2563eb',
        },
        structure: {
          DEFAULT: '#020817',
          sidebar: '#071426',
          surface: '#0f172a',
          border: '#1f2c3d',
        },
        ink: {
          DEFAULT: '#0f172a',
          soft: '#475569',
          faint: '#94a3b8',
          white: '#f8fafc',
        },
        surface: {
          DEFAULT: '#f8fafc',
          card: '#ffffff',
          muted: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};