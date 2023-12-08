module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
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