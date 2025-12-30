/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2ed16c',
          50: '#effef4',
          100: '#d9fce6',
          200: '#b5f8d0',
          300: '#7ef0b0',
          400: '#42e288',
          500: '#2ed16c', // Main Brand Color
          600: '#20aa54',
          700: '#1d8645',
          800: '#1d6a3b',
          900: '#195734',
          950: '#09311b',
        },
        background: {
          DEFAULT: '#030e07', // Deepest background
          light: '#0f1e16',   // Card background
        }
      }
    },
  },
  plugins: [],
}
