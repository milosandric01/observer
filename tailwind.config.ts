/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5e6ad2',
          hover: '#828fff',
          focus: '#5e69d1',
        },
        canvas: '#010102',
        surface: {
          1: '#0f1011',
          2: '#141516',
          3: '#18191a',
          4: '#191a1b',
        },
        ink: {
          DEFAULT: '#f7f8f8',
          muted: '#d0d6e0',
          subtle: '#8a8f98',
          tertiary: '#62666d',
        },
        hairline: {
          DEFAULT: '#23252a',
          strong: '#34343a',
          tertiary: '#3e3e44',
        },
        success: '#27a644',
        overlay: '#000000',
      },
      fontFamily: {
        display: ['"SF Pro Display"', 'system-ui', 'sans-serif'],
        body: ['"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"SF Mono"', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-xl': ['80px', { lineHeight: '1.05', letterSpacing: '-3px', fontWeight: '600' }],
        'display-lg': ['56px', { lineHeight: '1.10', letterSpacing: '-1.8px', fontWeight: '600' }],
        'display-md': ['40px', { lineHeight: '1.15', letterSpacing: '-1px', fontWeight: '600' }],
        'headline': ['28px', { lineHeight: '1.20', letterSpacing: '-0.6px', fontWeight: '600' }],
        'card-title': ['22px', { lineHeight: '1.25', letterSpacing: '-0.4px', fontWeight: '500' }],
        'subhead': ['20px', { lineHeight: '1.40', letterSpacing: '-0.2px', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '1.50', letterSpacing: '-0.1px', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.50', letterSpacing: '-0.05px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.50', letterSpacing: '0', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.40', letterSpacing: '0', fontWeight: '400' }],
        'button': ['14px', { lineHeight: '1.20', letterSpacing: '0', fontWeight: '500' }],
        'eyebrow': ['13px', { lineHeight: '1.30', letterSpacing: '0.4px', fontWeight: '500' }],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        pill: '9999px',
      },
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        'section': '96px',
      },
    },
  },
  plugins: [],
}
