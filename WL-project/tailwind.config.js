/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'snap-flash': 'snap-flash 0.4s ease-in-out',
      },
      keyframes: {
        'snap-flash': {
          '0%': {
            filter: 'brightness(1) drop-shadow(0 0 0 rgba(232, 54, 175, 0))',
          },
          '50%': {
            filter: 'brightness(1.4) drop-shadow(0 0 15px rgba(232, 54, 175, 0.8))',
          },
          '100%': {
            filter: 'brightness(1) drop-shadow(0 0 0 rgba(232, 54, 175, 0))',
          },
        },
      },
    },
  },
  plugins: [],
};
