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
        // SquareTrade-style trust blue — primary brand color across member + admin UI.
        primary: {
          50: '#eff5ff',
          100: '#dbe8ff',
          200: '#b8d2ff',
          300: '#8ab4ff',
          400: '#5a8fff',
          500: '#2f68f0',
          600: '#1d4ed8',
          700: '#173fb0',
          800: '#15348c',
          900: '#122b6e',
          950: '#0c1c49',
        },
        // Semantic colors — always mean the same thing, never used as decoration.
        status: {
          success: '#10B981',
          pro: '#8B5CF6',
          warning: '#F59E0B',
          danger: '#E11D48',
          neutral: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        xl2: '18px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 1px 0 rgba(15, 23, 42, 0.03)',
        cardHover: '0 8px 24px -4px rgba(15, 23, 42, 0.10), 0 2px 6px -2px rgba(15, 23, 42, 0.06)',
        dropdown: '0 12px 32px -8px rgba(15, 23, 42, 0.18), 0 4px 12px -4px rgba(15, 23, 42, 0.10)',
        focusRing: '0 0 0 4px rgba(29, 78, 216, 0.15)',
      },
    },
  },
  plugins: [],
}
