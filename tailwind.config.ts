import { type Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

export default {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#111928',
        secondary: '#637381',
        background: '#DADADA',
        backgroundLight: '#EEEEEE',
        backgroundDark: '#AAAAAA',
        reset: '#60a5fa',
      },
    },
  },
  plugins: [],
} satisfies Config
