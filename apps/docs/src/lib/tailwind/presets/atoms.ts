import type { Config } from 'tailwindcss'
import { typographyPlugin } from '../plugins/typography'
import { spacingPlugin } from '../plugins/spacing'

export const atomsPreset = {
  content: [],
  plugins: [typographyPlugin, spacingPlugin],
} satisfies Config
