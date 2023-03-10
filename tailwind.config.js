module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-fast': 'spin 0.6s ease infinite'
      },
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