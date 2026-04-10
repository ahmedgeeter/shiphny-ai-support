/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand blue
        primary: {
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        // Dark UI surfaces
        surface: {
          900: "#0f1117",   // app background
          800: "#161b27",   // sidebar / panel
          700: "#1e2535",   // card
          600: "#252d3d",   // hover
          500: "#2e3748",   // border / divider
        },
        // Text
        ink: {
          50:  "#f0f4ff",
          100: "#d6e0f5",
          300: "#94a3b8",
          500: "#64748b",
        },
        // Status
        success: "#22c55e",
        warning: "#f59e0b",
        danger:  "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundSize: {
        "200%": "200%",
      },
    },
  },
  plugins: [],
};
