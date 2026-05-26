/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff8ff',
          100: '#dbeefe',
          200: '#bfdffd',
          300: '#93cbfb',
          400: '#60aef7',
          500: '#3b8ff2',
          600: '#2570e7',
          700: '#1d5bd4',
          800: '#1e4aac',
          900: '#1e4088',
          950: '#172953',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
        },
        navy: {
          700: '#1e3a5f',
          800: '#1a2f4d',
          900: '#0f1d33',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.72)',
          light: 'rgba(255, 255, 255, 0.45)',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'river-flow': 'riverFlow 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        riverFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 143, 242, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(59, 143, 242, 0.4)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.1)',
        'glow-blue': '0 0 40px rgba(59, 143, 242, 0.15)',
      },
    },
  },
  plugins: [],
};
