/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "rgb(var(--base-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        "ink-2": "rgb(var(--ink-2-rgb) / <alpha-value>)",
        "ink-3": "rgb(var(--ink-3-rgb) / <alpha-value>)",
        line: "rgb(var(--line-rgb) / <alpha-value>)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        "accent-soft": "rgb(var(--accent-soft-rgb) / <alpha-value>)",
        teal: "rgb(var(--teal-rgb) / <alpha-value>)",
        "teal-soft": "rgb(var(--teal-soft-rgb) / <alpha-value>)",
        gold: "rgb(var(--gold-rgb) / <alpha-value>)",
        "gold-soft": "rgb(var(--gold-soft-rgb) / <alpha-value>)",
        sky: "rgb(var(--sky-rgb) / <alpha-value>)",
        "sky-soft": "rgb(var(--sky-soft-rgb) / <alpha-value>)",
        leaf: "rgb(var(--leaf-rgb) / <alpha-value>)",
        "leaf-soft": "rgb(var(--leaf-soft-rgb) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Baloo 2", "Trebuchet MS", "cursive"],
        text: ["Nunito", "Segoe UI", "sans-serif"],
      },
      spacing: {
        "3xs": "0.25rem",
        "2xs": "0.5rem",
        xs: "0.75rem",
        s: "1rem",
        m: "1.5rem",
        l: "2rem",
        xl: "3rem",
        "2xl": "4rem",
        "3xl": "6rem",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
      boxShadow: {
        sticker: "var(--shadow-sticker)",
        float: "var(--shadow-float)",
      },
    },
  },
  plugins: [],
};
