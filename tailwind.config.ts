import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        pantry: {
          green: '#1F5A3D',
          accent: '#E9B75D',
          cream: '#F5F1E8',
          leaf: '#DDE9D8',
          muted: '#687A6D',
          dark: '#1F2A1F',
        },
      },
      boxShadow: {
        soft: '0 16px 45px rgba(31, 90, 61, 0.12)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
    },
  },
  plugins: [],
};

export default config;
