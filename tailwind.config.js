/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pinktunes: {
          50: '#fff5f8',
          100: '#ffe7ef',
          200: '#ffcddd',
          300: '#ffa4c2',
          400: '#f875a2',
          500: '#e94f85',
          600: '#cf3268',
          700: '#ad2454',
          900: '#68152f',
        },
      },
      boxShadow: {
        soft: '0 16px 50px rgba(190, 55, 103, 0.10)',
      },
    },
  },
  plugins: [],
}