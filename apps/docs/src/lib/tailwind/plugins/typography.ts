import plugin from 'tailwindcss/plugin'
import { fontFamily } from 'tailwindcss/defaultTheme'

export const typographyPlugin = plugin(
  ({ addBase }) => {
    addBase({
      body: { '@apply font-sans': {} },
    })
  },
  {
    theme: {
      extend: {
        fontFamily: {
          sans: ['var(--font-geist-sans)', ...fontFamily.sans],
          mono: ['var(--font-geist-mono)', ...fontFamily.mono],
        },
      },
    },
  }
)
