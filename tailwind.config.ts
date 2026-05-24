import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#F1EAD8',
          light: '#F8F2E0',
          dark: '#E5DCC4',
        },
        ink: {
          DEFAULT: '#0E1A2B',
          soft: '#1F2A3C',
          mid: '#3A4A5C',
        },
        muted: '#6B6358',
        copper: {
          DEFAULT: '#9C6B3F',
          deep: '#7C5A38',
        },
        patina: '#4A6B5C',
        rust: '#8B2E2A',
        gold: '#B8924F',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Bodoni 72', 'Didot', 'serif'],
        serif: ['var(--font-serif)', 'Garamond', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        ultra: '0.32em',
      },
      boxShadow: {
        dispatch: '0 30px 60px -30px rgba(14, 26, 43, 0.18), 0 8px 20px -10px rgba(14, 26, 43, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
