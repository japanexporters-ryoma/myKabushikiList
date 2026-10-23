/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fdfbf7',
          100: '#f7f4ec',
          200: '#ede6d5',
          300: '#dfd2b5',
          400: '#ccb68d',
          500: '#bd9e6b',
        }
      }
    },
  },
  plugins: [],
}
