const config= {
  content: [
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './lib/**/*.{js,ts,jsx,tsx,mdx}',
],
  theme: {
    extend: {
      colors: {
        // Primary Palette
        'brazilian-green': {
          DEFAULT: '#00A859',
          dark: '#007A41',
          light: '#4DC48C',
        },
        'artisanal-amber': {
          DEFAULT: '#FFBF00',
          dark: '#CC9900',
          light: '#FFD54F',
        },
        // Secondary Palette
        'royal-blue': {
          DEFAULT: '#003399',
          accessible: '#0047CC',
        },
        'brazil-red': '#CC0000',
        // Neutral System
        white: '#FFFFFF',
        'off-white': '#F9F7F2',
        'light-grey': '#F5F5F5',
        'medium-grey': '#CCCCCC',
        'dark-grey': '#666666',
        charcoal: '#333333',
        'rich-black': '#212121',
        // Semantic Colors
        success: '#2E7D32',
        warning: '#F57C00',
        error: '#D32F2F',
        info: '#0288D1',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        opensans: ['Open Sans', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', '56px'],
        'h1': ['32px', '40px'],
        'h2': ['24px', '32px'],
        'h3': ['20px', '28px'],
        'h4': ['18px', '24px'],
        'body-large': ['18px', '28px'],
        'body': ['16px', '24px'],
        'body-small': ['14px', '20px'],
        'caption': ['12px', '16px'],
      },
      borderRadius: {
        'button': '8px',
        'card': '12px',
        'input': '8px',
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.15)',
        'dropdown': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-in-out',
        'fade-up': 'fadeUp 300ms ease-in-out',
        'slide-in': 'slideIn 250ms ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
    screens: {
      'sm': '375px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1440px',
    },
  },
  plugins: [],
};

export default config;