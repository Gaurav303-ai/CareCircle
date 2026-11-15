// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#13755D",
          dark: "#0F5A47",
          darkest: "#0B4334",
        },
        mint: "#D1F0E4",
        softMint: "#EBF8F3",
        background: "#F8F9FA",
        surface: "#FFFFFF",
        text: "#1A2421",
        secondaryText: "#52665F",
        success: "#16A34A",
        warning: "#D97706",
        error: "#DC2626",
        aiAccent: "#6366F1",
      },
      fontFamily: {
        heading: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem"
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.05)"
      }
    }
  },
  plugins: []
};
