/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFCFA",
          100: "#FAF7F0",
          200: "#F5F0E6",
        },
        ink: {
          900: "#1C1A16",
          700: "#3A352C",
          500: "#5C5648",
          300: "#8A8475",
        },
        gold: {
          50: "#F8F1DE",
          100: "#EBDBA8",
          300: "#C9A227",
          500: "#A9762F",
          600: "#8B6F2E",
          700: "#6B4F2A",
          900: "#3D2E18",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 14px rgba(28, 26, 22, 0.06)",
        cardHover: "0 12px 28px rgba(28, 26, 22, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out both",
        shimmer: "shimmer 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
