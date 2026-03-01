/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fbi: {
          dark: '#0a0e17',
          darker: '#060911',
          navy: '#1a2332',
          blue: '#1e3a5f',
          accent: '#3b82f6',
          warning: '#f59e0b',
          danger: '#ef4444',
          success: '#10b981',
          muted: '#64748b',
          border: '#1e293b'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
