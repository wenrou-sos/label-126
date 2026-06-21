/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'industrial': {
          50: '#f1f5f9',
          100: '#e2e8f0',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#0a0e1a',
          950: '#050810',
        },
        'accent': {
          cyan: '#06b6d4',
          green: '#22c55e',
          blue: '#3b82f6',
          red: '#ef4444',
          amber: '#f59e0b',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        'mono-num': ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'alarm-flash': 'alarm-flash 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
