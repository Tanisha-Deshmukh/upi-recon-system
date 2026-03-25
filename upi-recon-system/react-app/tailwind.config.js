/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover:   'var(--primary-hover)',
          light:   'var(--primary-light)',
          50:  '#eff6ff',
          100: '#dbeafe',
          900: '#1e3b8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        custom: '8px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px 0 rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
