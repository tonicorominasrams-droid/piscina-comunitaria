import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aigua: {
          50: "#eef9ff",
          100: "#d9f1ff",
          200: "#bbe7ff",
          300: "#8bd8ff",
          400: "#54c0ff",
          500: "#2ca2fb",
          600: "#1682f0",
          700: "#1369dc",
          800: "#1655b2",
          900: "#184a8c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
