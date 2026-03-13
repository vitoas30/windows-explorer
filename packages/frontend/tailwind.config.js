/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        explorer: {
          bg: '#ffffff',
          panel: '#f3f3f3',
          border: '#e0e0e0',
          hover: '#e5f3ff',
          active: '#cce4f7',
          text: '#1a1a1a',
          muted: '#6e6e6e',
          accent: '#0067c0',
        },
      },
    },
  },
  plugins: [],
}