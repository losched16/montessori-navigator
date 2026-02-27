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
        // Primary palette - calm, natural, grounded
        navy: {
          50: '#f0f4f7',
          100: '#d9e4ed',
          200: '#b3c9db',
          300: '#8daec9',
          400: '#5a8ab0',
          500: '#2d6a9f',
          600: '#1B3A4B',
          700: '#162f3d',
          800: '#11242f',
          900: '#0c1921',
        },
        teal: {
          50: '#f0f9f9',
          100: '#d4efef',
          200: '#a9dfdf',
          300: '#7ecfcf',
          400: '#53bfbf',
          500: '#2E8B8B',
          600: '#257070',
          700: '#1c5555',
          800: '#133a3a',
          900: '#0a1f1f',
        },
        sage: {
          50: '#f5f7f2',
          100: '#e8ece2',
          200: '#d1d9c5',
          300: '#bac6a8',
          400: '#a3b38b',
          500: '#8CA06E',
          600: '#708058',
          700: '#546042',
          800: '#38402c',
          900: '#1c2016',
        },
        warm: {
          50: '#fdf8f3',
          100: '#f9edd9',
          200: '#f3dbb3',
          300: '#edc98d',
          400: '#e7b767',
          500: '#D4A055',
          600: '#aa8044',
          700: '#7f6033',
          800: '#554022',
          900: '#2a2011',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
