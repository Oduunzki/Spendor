/** @type {import('tailwindcss').Config} */
//
// Spendor — toned-down palette.
// Existing classnames (text-green, bg-purple/20, shadow-green-glow,
// animate-streak-glow, ...) all still resolve — they just render in the
// softer v2 visual language now.
//
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg:           '#0E0D17',
        card:         '#1C1A28',
        'card-light': '#252335',
        border:       '#2A2740',

        // accents — muted, sophisticated
        green: {
          DEFAULT: '#6EE7A0',   // saved money — soft mint
          dark:    '#4ADE80',
          glow:    '#6EE7A026',
        },
        yellow: {
          DEFAULT: '#E8C46A',   // XP / level — muted gold
          dark:    '#C9A648',
          glow:    '#E8C46A22',
        },
        red: {
          DEFAULT: '#F5867B',   // warning / impulse — soft coral
          dark:    '#E8625B',
          glow:    '#F5867B22',
        },
        purple: {
          DEFAULT: '#9D89E8',   // category / brand
          dark:    '#7C5CFF',
          glow:    '#9D89E822',
        },
        fire: {
          DEFAULT: '#F49F5A',   // streak — muted ember
          dark:    '#E07A3F',
        },
      },
      boxShadow: {
        // glows are now subtle drop-shadows, not neon halos
        'green-glow':  '0 4px 16px rgba(110, 231, 160, .14)',
        'yellow-glow': '0 4px 14px rgba(232, 196, 106, .14)',
        'purple-glow': '0 4px 14px rgba(157, 137, 232, .14)',
        'red-glow':    '0 4px 14px rgba(245, 134, 123, .14)',
        'card':        '0 1px 0 rgba(255,255,255,.02) inset, 0 8px 24px rgba(0,0,0,.25)',
      },
      borderRadius: {
        'card': '18px',
      },
      keyframes: {
        // kept (calm versions)
        'fade-up': {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        'xp-pop': {
          '0%':   { transform: 'scale(.85) translateY(0)',    opacity: '0' },
          '20%':  { transform: 'scale(1) translateY(-8px)',   opacity: '1' },
          '100%': { transform: 'scale(1) translateY(-32px)',  opacity: '0' },
        },
        'streak-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(244, 159, 90, 0)' },
          '50%':      { boxShadow: '0 0 0 4px rgba(244, 159, 90, .08)' },
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.015)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'flame': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%':      { transform: 'translateY(-1px) scale(1.02)' },
        },
      },
      animation: {
        'fade-up':     'fade-up 0.3s ease-out',
        'xp-pop':      'xp-pop 1.4s ease-out forwards',
        'streak-glow': 'streak-glow 3s ease-in-out infinite',
        'pulse-scale': 'pulse-scale 3s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'flame':       'flame 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
