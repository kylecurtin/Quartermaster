import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 'parchment' tokens now carry the dark ocean palette.
        // Names retained for diff minimality; values inverted to navy.
        parchment: {
          DEFAULT: '#0B1F3A',
          light: '#13294A',
          dark: '#071528',
        },
        ink: {
          DEFAULT: '#F4F1E8',
          soft: '#E8E2D2',
          mid: '#B8C0CD',
        },
        muted: '#8A95A8',
        copper: {
          DEFAULT: '#D4A45A',
          deep: '#B88440',
        },
        patina: '#6BAFA9',
        rust: '#E07B6C',
        gold: '#E6B770',
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
        dispatch:
          '0 30px 60px -30px rgba(0, 0, 0, 0.55), 0 8px 20px -10px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
