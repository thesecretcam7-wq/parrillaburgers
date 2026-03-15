import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#111217",
          dark: "#1A1B21",
          card: "#22232B",
          border: "#2E3038",
          gold: "#D4A017",
          "gold-light": "#E8B830",
          "gold-dark": "#B8881A",
          white: "#F5F0E8",
          gray: "#CCCCCC",
          "gray-dark": "#888899",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #111217 0%, #1A1B21 50%, #111217 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
