import plugin from 'tailwindcss/plugin'

export const spacingPlugin = plugin(() => {}, {
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        xl: '2rem',
      },
    },
    extend: {
      spacing: {
        nav: 'var(--nav-height)',
      },
    },
  },
})
