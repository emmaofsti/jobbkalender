import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./screens/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "hsl(var(--surface))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
        text: "hsl(var(--text))",
        muted: "hsl(var(--muted))",
        accent: "hsl(var(--accent))",
        accent2: "hsl(var(--accent-2))",
        danger: "hsl(var(--danger))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(12, 20, 33, 0.08)",
        card: "0 8px 24px rgba(12, 20, 33, 0.08)"
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px"
      }
    }
  },
  plugins: []
};

export default config;
