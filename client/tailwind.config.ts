import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'Noto Sans Devanagari', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Cinzel', 'Georgia', 'serif'],
        hindi: ['Noto Sans Devanagari', 'Outfit', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        gov: {
          navy: '#0A2540',
          'navy-dark': '#061626',
          'navy-light': '#133E87',
          saffron: '#D97706',
          'saffron-light': '#F59E0B',
          'saffron-dark': '#B45309',
          green: '#15803D',
          'green-light': '#16A34A',
          'green-dark': '#14532D',
          gold: '#C29B38',
          ashoka: '#002B49',
          crest: '#E2E8F0',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(10, 37, 64, 0.08)',
        glass: '0 8px 32px 0 rgba(10, 37, 64, 0.07)',
        glow: '0 0 25px -5px rgba(19, 62, 135, 0.35)',
        gov: '0 2px 10px rgba(10, 37, 64, 0.06), 0 1px 3px rgba(0, 0, 0, 0.05)',
        'gov-card': '0 4px 20px -2px rgba(10, 37, 64, 0.07), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;


