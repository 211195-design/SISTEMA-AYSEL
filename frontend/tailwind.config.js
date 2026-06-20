/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pie1: '#8B5CF6',
        pie2: '#EC4899',
        pie3: '#06B6D4',
        pie4: '#22C55E',
      }
    },
  },
  plugins: [],
}
