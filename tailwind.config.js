/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#0C1B13',
          900: '#14291D',
          800: '#1B3828',
          700: '#254E37',
          600: '#326649',
          500: '#41825E',
        },
        mint: {
          50: '#F2F8F5',
          100: '#E2F1E9',
          200: '#C5E3D3',
          300: '#9ECCB4',
          400: '#6FAf8E',
          500: '#44926C',
          600: '#317353',
        },
        cream: {
          50: '#FBF9F5',
          100: '#F5EFE6',
          200: '#EBE2D4',
          300: '#DDD1BD',
          400: '#C9B89E',
        },
        coral: {
          50: '#FFF5F2',
          100: '#FFE6E0',
          200: '#FFCEBE',
          500: '#E06447',
          600: '#C84F32',
          700: '#A93B22',
        },
        charcoal: {
          900: '#161E1B',
          800: '#232D29',
          700: '#37453F',
          600: '#52645D',
          500: '#73877F',
          400: '#9CB0A7',
          300: '#C4D4CD',
          200: '#E1EBE6',
          100: '#F0F5F2',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(22, 41, 29, 0.06), 0 1px 3px -1px rgba(22, 41, 29, 0.04)',
        'card': '0 4px 20px -4px rgba(22, 41, 29, 0.08), 0 2px 6px -2px rgba(22, 41, 29, 0.04)',
        'modal': '0 20px 40px -12px rgba(22, 41, 29, 0.2), 0 1px 3px rgba(22, 41, 29, 0.06)',
        'glow': '0 0 24px -4px rgba(68, 146, 108, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
