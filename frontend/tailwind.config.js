/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary medical blues
        'med-navy':    '#0A1628',   // Deep navy — main background
        'med-dark':    '#0D1F3C',   // Cards, panels
        'med-mid':     '#112240',   // Secondary surfaces
        'med-teal':    '#00B4D8',   // Primary accent (teal — medical/clinical)
        'med-teal-lt': '#90E0EF',   // Light teal for text highlights
        'med-cyan':    '#CAF0F8',   // Very light for subtle glows
        // Accent colors
        'med-green':   '#06D6A0',   // Healthy / Normal result
        'med-red':     '#EF233C',   // Disease detected
        'med-amber':   '#FFB703',   // Warning / uncertain
        'med-white':   '#F0F4F8',   // Body text
        'med-muted':   '#8892A4',   // Secondary text
        // Glass morphism
        'glass-border':'rgba(0, 180, 216, 0.15)',
        
        // Legacy support (to avoid breaking components immediately)
        medical: {
          400: '#00B4D8',
          500: '#00B4D8',
          600: '#0077B6',
        }
      },
      fontFamily: {
        'display': ['Playfair Display', 'Georgia', 'serif'],  // Headlines — editorial
        'body':    ['Inter', 'system-ui', 'sans-serif'],       // Body text — clinical
        'mono':    ['JetBrains Mono', 'monospace'],            // Data, numbers
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
