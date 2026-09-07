/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Resolve through the "R G B" custom properties in tokens.css (the
        // `rgb(... / <alpha-value>)` form so opacity modifiers like
        // `border-ink/15` keep working) rather than literal hex, so a
        // single `[data-track="tresor"]` scope can retint every
        // `green`/`brass`/`paper`/`ink` utility class in the app to the
        // Trésor track's navy/silver palette without touching any
        // component. `paper-2` and `stamp` are deliberately shared across
        // tracks (see AGENT-TRESOR.md §2).
        ink: "rgb(var(--color-ink-rgb) / <alpha-value>)",
        green: {
          DEFAULT: "rgb(var(--color-green-rgb) / <alpha-value>)",
          dk: "rgb(var(--color-green-dk-rgb) / <alpha-value>)",
        },
        brass: "rgb(var(--color-brass-rgb) / <alpha-value>)",
        paper: {
          DEFAULT: "rgb(var(--color-paper-rgb) / <alpha-value>)",
          2: "rgb(var(--color-paper-2-rgb) / <alpha-value>)",
        },
        stamp: "rgb(var(--color-stamp-rgb) / <alpha-value>)",
      },
      fontFamily: {
        kufi: ["Noto Kufi Arabic", "sans-serif"],
        arabic: ["IBM Plex Sans Arabic", "sans-serif"],
        latin: ["IBM Plex Sans", "sans-serif"],
      },
      borderRadius: {
        interactive: "2px",
      },
    },
  },
  plugins: [],
};
