/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#14b8a6", // Teal 500 (modified for cooler glassmorphism)
        secondary: "#f59e0b", // Amber 500
        tertiary: "#ef4444", // Red 500
        neutralText: "#9ca3af",
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      }
    },
  },
  plugins: [],
}
