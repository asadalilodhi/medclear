/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2fdf9',
          100: '#e1faf0',
          500: '#10b981',
          600: '#059669',
          900: '#064e3b',
        }
      }
    },
  },
  plugins: [],
}
