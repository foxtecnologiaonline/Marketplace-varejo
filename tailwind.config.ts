import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ecff",
          200: "#bcdcff",
          300: "#8ec4ff",
          400: "#58a2ff",
          500: "#2f80f6",
          600: "#1c5fd1",
          700: "#1a4ba8",
          800: "#1b3f87",
          900: "#1b3670",
          950: "#13223f"
        },
        accent: {
          500: "#f97316",
          600: "#ea580c"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 1px rgb(0 0 0 / 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
