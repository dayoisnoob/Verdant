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
        green: {
          DEFAULT: "#2D6A4F",
          light: "#52B788",
          pale: "#D8F3DC",
          mid: "#40916C",
          dark: "#1B4332",
        },
        orange: {
          DEFAULT: "#E86A2E",
          light: "#F59C6B",
          pale: "#FEF0E8",
          dark: "#C4521A",
        },
        cream: "#FAF7F0",
        earth: "#8B5E3C",
        verdant: {
          dark: "#1A1A1A",
          text: "#2C2C2C",
          muted: "#666666",
          border: "rgba(45,106,79,0.12)",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "fade-up": "fadeUp 0.7s ease both",
        float: "float 4s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(22px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse 60% 50% at 60% 50%, rgba(82,183,136,0.08), transparent)",
      },
    },
  },
  plugins: [],
};

export default config;
