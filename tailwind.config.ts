import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F6F3EC",
        white: "#FDFCFA",
        stone: "#C9BFA8",
        "stone-dark": "#A79C82",
        charcoal: "#16130F",
        "charcoal-soft": "#28231C",
        brass: "#A9814A",
        "brass-light": "#CBA46E",
        olive: "#454B39",
        taupe: "#8C8272",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "power3-out": "cubic-bezier(0.215, 0.61, 0.355, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
