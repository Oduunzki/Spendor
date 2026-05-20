/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
      colors: {
        bg: '#0A0F1E',
        card: '#111827',
        'card-light': '#1F2937',
        border: '#374151',
        green: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
          glow: '#22C55E33',
        },
        yellow: {
          DEFAULT: '#EAB308',
          dark: '#CA8A04',
          glow: '#EAB30833',
        },
        red: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
          glow: '#EF444433',
        },
        purple: {
          DEFAULT: '#8B5CF6',
          dark: '#7C3AED',
          glow: '#8B5CF633',
        },
      },
      boxShadow: {
        'green-glow': '0 0 20px #22C55E44, 0 0 40px #22C55E22',
        'yellow-glow': '0 0 20px #EAB30844, 0 0 40px #EAB30822',
        'purple-glow': '0 0 20px #8B5CF644, 0 0 40px #8B5CF622',
        'red-glow': '0 0 20px #EF444444',
      },
      keyframes: {
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'xp-pop': {
          '0%': { transform: 'scale(0) translateY(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2) translateY(-20px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(-40px)', opacity: '0' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'streak-glow': {
          '0%, 100%': { boxShadow: '0 0 20px #22C55E44' },
          '50%': { boxShadow: '0 0 40px #22C55E88, 0 0 80px #22C55E44' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
        'xp-pop': 'xp-pop 1s ease-out forwards',
        'fade-up': 'fade-up 0.3s ease-out',
        'streak-glow': 'streak-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
