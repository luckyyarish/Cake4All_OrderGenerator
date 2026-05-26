/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#F4EFE6',
        'brand-surface': '#FFFFFF',
        'brand-primary': '#4A3422',
        'brand-secondary': '#7A5C3E',
        'brand-accent': '#5F7D5A',
        'brand-border': '#D8CFC3',
        'brand-success': '#5F7D5A',
        'brand-error': '#B94A48',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Montserrat', 'sans-serif'],
        heading2: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}