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
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        brand: {
          blue:       '#185FA5',
          'blue-lt':  '#E6F1FB',
          'blue-dk':  '#0C447C',
          green:      '#639922',
          'green-lt': '#EAF3DE',
          red:        '#E24B4A',
          'red-lt':   '#FCEBEB',
          amber:      '#BA7517',
          'amber-lt': '#FAEEDA',
          teal:       '#0F6E56',
          'teal-lt':  '#E1F5EE',
          purple:     '#534AB7',
          'purple-lt':'#EEEDFE',
          gray:       '#5F5E5A',
          'gray-lt':  '#F1EFE8',
        }
      },
      screens: {
        'xs': '375px',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in':  'fadeIn 0.2s ease-out',
        'bar-grow': 'barGrow 0.6s ease-out forwards',
      },
      keyframes: {
        slideUp:  { from: { transform: 'translateY(100%)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        barGrow:  { from: { width: '0%' }, to: { width: 'var(--bar-width)' } },
      }
    },
  },
  plugins: [],
}
export default config
