module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['0.5rem', { lineHeight: '0.75rem' }]
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(120deg, var(--tw-gradient-stops))'
      }
    },
  },
  plugins: [],
}