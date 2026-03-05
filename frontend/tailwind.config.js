/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#020617",
        surface: "#020617",
        surfaceElevated: "#020617",
        accent: "#38bdf8",
        danger: "#f97373"
      }
    }
  },
  plugins: []
};

