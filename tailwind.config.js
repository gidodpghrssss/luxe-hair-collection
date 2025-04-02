/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4f7',
          100: '#fbe8ef',
          200: '#f9d1e0',
          300: '#f5aac5',
          400: '#ef77a1',
          500: '#e54f7f',
          600: '#d22c5e',
          700: '#b01e4b',
          800: '#931c42',
          900: '#7c1b3c',
          950: '#470b1e',
        },
        secondary: {
          50: '#f5f7fa',
          100: '#ebeef3',
          200: '#d2dbe6',
          300: '#abbed1',
          400: '#7d9ab7',
          500: '#5d7d9f',
          600: '#486585',
          700: '#3b526c',
          800: '#34475c',
          900: '#2f3e4f',
          950: '#1e2736',
        },
        accent: {
          50: '#fefce8',
          100: '#fff9c2',
          200: '#fff088',
          300: '#ffe144',
          400: '#ffcf10',
          500: '#efb403',
          600: '#cc8a02',
          700: '#a36206',
          800: '#874d0c',
          900: '#733f10',
          950: '#432105',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-playfair)'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
