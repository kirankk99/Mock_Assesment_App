import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: "#a300d6",
        dark: "#121212",
        "bg-light": "#f8f9fa",
        "border-color": "#e0e0e0",
        "text-main": "#333333",
        "success-green": "#2e7d32",
        "error-red": "#c62828",
        "warning-amber": "#e65100",
      },
      fontFamily: {
        sans: [
          "Segoe UI",
          "Tahoma",
          "Geneva",
          "Verdana",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
