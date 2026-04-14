/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: { 500: '#0bc5cf', 600: '#0891b2' },
      },
    },
  },
  plugins: [],
};
