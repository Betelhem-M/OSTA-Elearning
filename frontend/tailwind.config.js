/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        darkMode: 'class',
        primary: {
          DEFAULT: '#2E7D32',
          dark: '#1A3C2B',
          darker: '#173B21',
          light: '#E8F5E9',
          hover: '#256628',
        },
        gold: {
          DEFAULT: '#F9A825',
          dark: '#8a6200',
          light: '#FFF8E1',
        },
        surface: {
          DEFAULT: '#F8FAFC',
        },
        ink: {
          DEFAULT: '#1A202C',
          soft: '#64748B',
          faint: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}