/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14181f",
        paper: "#f7f7f5",
        amber: { 50: "#fffbeb", 600: "#b45309", 700: "#92400e" },
        emerald: { 50: "#ecfdf5", 600: "#15803d" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
