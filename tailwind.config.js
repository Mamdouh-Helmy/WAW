/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main':        '#121212',
        'bg-card':        '#1e1e1e',
        'bg-card-hover':  '#2a2a2a',
        'text-primary':   '#FCF2ED',
        'text-secondary': '#898989',
        'lime':           '#CCF47F',
        'blue':           '#4469F2',
        'yellow':         '#F7E328',
        'red':            '#E20E3C',
        'phosphor':       '#CCF47F',
      },
      fontFamily: {
        'lyon':        ['Lyon', 'Playfair Display', 'serif'],
        'lyon-arabic': ['Lyon Arabic', 'Lyon', 'Playfair Display', 'serif'],
        'ko-sans':     ['Ko Sans', 'Inter', 'sans-serif'],
      },
      maxWidth: {
        'container': '1200px',
      },
    },
  },
  plugins: [],
}