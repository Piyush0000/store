/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#C9A84C',
        'gold-light': '#FFD98A',
        'bg-primary': '#000000',
        'bg-secondary': '#111111',
        'bg-card': '#1a1a1a',
        'text-primary': '#F5EFE6',
        'text-muted': '#9A8F85',
        'border-custom': '#2e2e2e',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        elegant: ['Cormorant Garamond', 'serif'],
      },
    },
  },
  plugins: [],
}