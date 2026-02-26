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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['var(--font-roboto)', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        condensed: ['var(--font-roboto-condensed)', 'Roboto Condensed', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
      keyframes: {
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
