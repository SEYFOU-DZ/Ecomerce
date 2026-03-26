/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#02C3B6',
        secondary: '#02b2b6'
      },
       borderWidth: {
        '1.5': '1.5px',
      },
      keyframes: {
        cartBump: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        cartBump: 'cartBump 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        fadeUp: 'fadeUp 0.22s ease-out both',
      },
    },
  },
  plugins: [],
}
