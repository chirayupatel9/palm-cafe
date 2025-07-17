/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f9f7',
          100: '#f1f3f0',
          200: '#e3e7e1',
          300: '#d1d7cd',
          400: '#b8c2b0',
          500: '#75826b',
          600: '#6a7560',
          700: '#5a6351',
          800: '#4a5243',
          900: '#3e4538',
        },
        secondary: {
          50: '#f0f3f8',
          100: '#e1e7f1',
          200: '#c3d0e3',
          300: '#9db3d0',
          400: '#6b8bb8',
          500: '#153059',
          600: '#132b50',
          700: '#102443',
          800: '#0d1d37',
          900: '#0b192f',
        },
        accent: {
          50: '#fefcf7',
          100: '#fdf9ef',
          200: '#fbf2d7',
          300: '#f8e8bd',
          400: '#f4e1ba',
          500: '#f0d9a8',
          600: '#e8c885',
          700: '#dbb05c',
          800: '#c99a3e',
          900: '#a67e32',
        }
      }
    },
  },
  plugins: [],
} 