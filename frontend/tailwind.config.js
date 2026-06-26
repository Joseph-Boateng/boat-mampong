/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8e1',
          100: '#faf0c0',
          200: '#f5d878',
          300: '#E4C158',
          400: '#C8952C',
          500: '#B07A12',
          600: '#9A6600',
          700: '#7A5000',
          900: '#4A2E00',
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
