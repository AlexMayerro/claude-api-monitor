/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0F',
          secondary: '#12121A',
          tertiary: '#1A1A28',
        },
        surface: '#22222F',
        border: '#2A2A3A',
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0B8',
          muted: '#6B7280',
        },
        accent: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          glow: '#8B5CF640',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        gradient: {
          start: '#8B5CF6',
          end: '#6366F1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: ['28px', { lineHeight: '1.15', fontWeight: '800' }],
        screen: ['22px', { lineHeight: '1.2', fontWeight: '700' }],
        card: ['18px', { lineHeight: '1.3', fontWeight: '700' }],
        body: ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        badge: ['11px', { lineHeight: '1.2', fontWeight: '600' }],
      },
      boxShadow: {
        glow: '0 0 24px 0 rgba(139, 92, 246, 0.45)',
        'glow-sm': '0 0 12px 0 rgba(139, 92, 246, 0.4)',
        device: '0 30px 80px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.06)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
