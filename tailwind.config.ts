import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
        serif: ["var(--font-dm-serif)", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        bg: {
          base:    "#090a0e",
          surface: "#0f1117",
          raised:  "#161920",
          overlay: "#1d2130",
        },
        border: {
          subtle: "#252a38",
          muted:  "#2e3447",
        },
        text: {
          primary:   "#dde1ec",
          secondary: "#7c8196",
          muted:     "#4a4f62",
        },
        accent: {
          amber:  "#e5993a",
          green:  "#4ecba5",
          blue:   "#5b9cf6",
          red:    "#f87171",
          purple: "#a78bfa",
          pink:   "#f9a8d4",
          yellow: "#fcd34d",
          teal:   "#6ee7b7",
          slate:  "#94a3b8",
        },
      },
      borderRadius: {
        card: "10px",
        badge: "4px",
      },
      animation: {
        rise: "rise 0.22s ease both",
        slideIn: "slideIn 0.25s ease both",
        fadeIn: "fadeIn 0.18s ease both",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
