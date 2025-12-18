/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'luminate-navy': '#0D1834',
        'luminate-blue': '#96DAF8',
      },
    },
  },
  plugins: [],
}
