/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#171714',
        paper: '#eeece6',
        parchment: '#d9d3c7',
        rust: '#b35135',
      },
      fontFamily: {
        sans: ['Jost', 'sans-serif'],
        serif: ['Bodoni Moda', 'serif'],
      },
    },
  },
  plugins: [],
}
