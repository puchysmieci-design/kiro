/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ed',
          100: '#fdedd4',
          200: '#fad7a8',
          300: '#f6ba71',
          400: '#f19338',
          500: '#ee7b15',
          600: '#df600b',
          700: '#b9480b',
          800: '#933910',
          900: '#773110',
        },
        warm: {
          50: '#fdf8f6',
          100: '#f9ede8',
          200: '#f3dbd1',
          300: '#eac3b0',
          400: '#dfa189',
          500: '#d27d64',
          600: '#c0644c',
          700: '#a1513d',
          800: '#854435',
          900: '#6e3c30',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
