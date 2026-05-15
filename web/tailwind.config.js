/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-bg':      '#0a0a0f',
        'cyber-surface': '#0f0f1a',
        'cyber-panel':   '#13131f',
        'cyber-border':  '#1a1a2e',
        'neon-cyan':     '#00ffff',
        'neon-pink':     '#ff00aa',
        'neon-purple':   '#8800ff',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Rajdhani"', '"Orbitron"', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow':   '0 0 8px #00ffff, 0 0 20px #00ffff44',
        'pink-glow':   '0 0 8px #ff00aa, 0 0 20px #ff00aa44',
        'cyan-glow-lg':'0 0 15px #00ffff, 0 0 40px #00ffff66',
        'pink-glow-lg':'0 0 15px #ff00aa, 0 0 40px #ff00aa66',
      },
      animation: {
        'pulse-cyan': 'pulse-cyan 2s ease-in-out infinite',
        'pulse-pink': 'pulse-pink 2s ease-in-out infinite',
        'scanline':   'scanline 8s linear infinite',
        'flicker':    'flicker 0.15s infinite',
        'slide-in':   'slideIn 0.3s ease-out',
      },
      keyframes: {
        'pulse-cyan': {
          '0%, 100%': { boxShadow: '0 0 8px #00ffff, 0 0 20px #00ffff44' },
          '50%':       { boxShadow: '0 0 15px #00ffff, 0 0 40px #00ffff88' },
        },
        'pulse-pink': {
          '0%, 100%': { boxShadow: '0 0 8px #ff00aa, 0 0 20px #ff00aa44' },
          '50%':       { boxShadow: '0 0 15px #ff00aa, 0 0 40px #ff00aa88' },
        },
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.85' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
