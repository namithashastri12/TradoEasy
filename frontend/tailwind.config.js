/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0A0D14',
          panel: '#101522',
          surface: '#161C2D',
          hover: '#1E263C',
          border: '#232C42',
          'border-light': '#2F3B59',
          muted: '#8492A6',
          text: '#F3F4F6',
          heading: '#FFFFFF',
          accent: '#3B82F6',
          green: '#10B981',
          'green-glow': '#059669',
          red: '#EF4444',
          'red-glow': '#DC2626',
          amber: '#F59E0B',
          cyan: '#06B6D4',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
