const customColorPalette = {
  purple: '#A21CAF',
  green: '#22C55E',
  blue: '#00AFCA',
  yellow: '#FEC604',
  red: '#BE123C',
  fg: '#F7F7F7',
  bg: '#121212',
  neutral: {
    50: '#F7F7F7',
    100: '#E1E1E1',
    200: '#CFCFCF',
    300: '#B1B1B1',
    400: '#9E9E9E',
    500: '#7E7E7E',
    600: '#626262',
    700: '#515151',
    800: '#3B3B3B',
    900: '#222222',
  },
};

const theme = {
  extend: {
    animation: {
      'spin-slow': 'spin 4s linear infinite',
    },
    gridTemplateColumns: {
      custom: 'repeat(auto-fit, minmax(70px, 1fr))',
    },
    colors: {
      override: customColorPalette,
    },
  },
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    mono: '\'Source Code Pro\', monospace',
    serif: '\'Roboto Slab\', serif',
  },
};

const config = {
  content: [
    './index.html',
    './src/**/*.{svelte,ts}',
  ],
  theme,
  plugins: [],
};

export default config;
