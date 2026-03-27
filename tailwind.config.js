/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6C3DE8",
        secondary: "#EC4899",
        lightBg: "#F8F9FA",
      }
    },
  },
  plugins: [],
}
