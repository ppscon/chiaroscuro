/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          'serif': ['"Cormorant Garamond"', 'serif'],
          'sans': ['Inter', 'system-ui', 'sans-serif'],
        },
        colors: {
          // Custom color palette inspired by oil paints
          'canvas': {
            50: '#f9f7f4',
            100: '#f0ece4',
            200: '#e2dac9',
            300: '#d5c9ae',
            400: '#c7b793',
            500: '#b9a578',
            600: '#a08860',
            700: '#876f4e',
            800: '#6e583f',
            900: '#554430',
            950: '#2b2218',
          },
          'pigment': {
            50: '#eef2ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
            800: '#3730a3',
            900: '#312e81',
            950: '#1e1b4b',
          },
        },
        backdropFilter: {
          'none': 'none',
          'blur': 'blur(10px)',
        },
        boxShadow: {
          'inner-strong': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.15)',
        },
        animation: {
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }