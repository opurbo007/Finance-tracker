import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent:   '#6C63FF',
        emerald:  '#10B981',
        rose:     '#F43F5E',
        amber:    '#F59E0B',
        sky:      '#38BDF8',
        violet:   '#A78BFA',
      },
      screens: { xs: '375px' },
      animation: {
        'fade-up':    'fadeUp 0.3s ease both',
        'slide-up':   'slideUp 0.32s cubic-bezier(0.32,0.72,0,1)',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow':  'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
