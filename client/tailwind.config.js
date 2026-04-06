/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0a0f',
          surface: '#111118',
          card: '#16161f',
          hover: '#1c1c28',
          border: '#1e1e2e',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
          muted: '#3730a3',
          glow: 'rgba(99,102,241,0.15)',
        },
        txt: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
          muted: '#64748b',
          code: '#a5b4fc',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      typography: (theme) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.txt.primary'),
            '--tw-prose-headings': theme('colors.txt.primary'),
            '--tw-prose-code': theme('colors.txt.code'),
            '--tw-prose-links': theme('colors.accent.DEFAULT'),
            '--tw-prose-quotes': theme('colors.txt.secondary'),
            '--tw-prose-hr': theme('colors.bg.border'),
            '--tw-prose-pre-bg': theme('colors.bg.card'),
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          },
        },
      }),
      boxShadow: {
        'glow-sm': '0 0 12px rgba(99,102,241,0.25)',
        'glow': '0 0 24px rgba(99,102,241,0.35)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
