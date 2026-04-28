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
        "gradient-gold-soft":
          "linear-gradient(135deg, rgba(212,160,23,0.1) 0%, rgba(212,160,23,0.05) 100%)",
        "gradient-hover":
          "linear-gradient(180deg, rgba(212,160,23,0.15) 0%, transparent 100%)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        gold: "var(--shadow-gold)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s var(--ease-out)",
        "slide-up": "slideUp 0.4s var(--ease-out)",
        "scale-in": "scaleIn 0.3s var(--ease-premium)",
        "spin-smooth": "spinSmooth 2s linear infinite",
        shimmer: "shimmer 1.5s infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      transitionTimingFunction: {
        "ease-in": "var(--ease-in)",
        "ease-out": "var(--ease-out)",
        "ease-in-out": "var(--ease-in-out)",
        premium: "var(--ease-premium)",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        base: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
