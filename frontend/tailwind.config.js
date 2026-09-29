/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "gauge-room": "#11171A",
        "gauge-panel": "#1A2226",
        "rule": "#2E3B40",
        "paper": "#E9E4D3",
        "paper-panel": "#DDD6C0",
        "ink": "#1E2723",
        "offwhite": "#E6E2D3",
        "lichen": "#6E8B74",
        "contour": "#7D8A80",
        "watch-amber": "#E0A526",
        "danger-vermilion": "#E2461F",
        flood: {
          shallow: "#E7D9A8",
          mid1: "#C9A65B",
          mid2: "#A8702F",
          deep: "#6B3213",
        },
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      fontSize: {
        'scale-11': ['11px', '14px'],
        'scale-13': ['13px', '16px'],
        'scale-15': ['15px', '20px'],
        'scale-20': ['20px', '24px'],
        'scale-28': ['28px', '32px'],
        'scale-44': ['44px', '48px'],
        'scale-88': ['88px', '88px'],
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        full: '0px',
      },
    },
  },
  plugins: [],
}
