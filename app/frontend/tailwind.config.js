/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFD700", // Gold/Yellow
          black: "#1a1a1a",
        },
        primary: "#007AFF",
        secondary: "#666666",
        success: "#4CAF50",
        danger: "#F44336",
        warning: "#FFC107",
        info: "#2196F3",
        dark: {
          bg: "#121212",
          card: "#1E1E1E",
          text: "#FFFFFF",
          textSecondary: "#B0B0B0"
        },
        light: {
          bg: "#FFFFFF",
          card: "#F5F5F5",
          text: "#333333",
          textSecondary: "#666666"
        }
      }
    },
  },
  plugins: [],
}
