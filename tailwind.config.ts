import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta extraída da logo da Blue Malharia (azul-marinho + azul médio + ciano).
        brand: {
          50: "#eaf6fc",
          100: "#cdeaf7",
          200: "#9ad8f0",
          300: "#5cc0e6",
          400: "#2aa8d8",
          500: "#1c87bc",
          600: "#156ca0",
          700: "#135884",
          800: "#15476a",
          900: "#1a3a58",
          950: "#141f4a"
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
