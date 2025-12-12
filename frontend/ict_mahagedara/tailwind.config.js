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
          50: '#f5f7ff',
          100: '#ebefff',
          200: '#d6dffe',
          300: '#b3c0fd',
          400: '#8a9bfa',
          500: '#667eea',
          600: '#5568d3',
          700: '#4554b8',
          800: '#384495',
          900: '#2f3a78',
        },
        secondary: {
          500: '#764ba2',
          600: '#653d8a',
        }
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce': 'bounce 1.4s infinite ease-in-out',
      },
      keyframes: {
        slideIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}

