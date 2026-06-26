/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fefce8',
          100: '#fef9c3',
          200: '#fde68a',
          300: '#F0C040',
          400: '#D4AF37',
          500: '#C9A227',
          600: '#B8960C',
          700: '#9A7D0A',
          900: '#5C4A06',
        },
        dark: {
          950: '#050505',
          900: '#0C0C0C',
          800: '#111111',
          700: '#1A1A1A',
          600: '#222222',
          500: '#2C2C2C',
          400: '#3A3A3A',
          300: '#4A4A4A',
        },
      },
    },
  },
  plugins: [],
}
