import type { Config } from 'tailwindcss'
import { shadcnUIPlugin } from '../plugins/shadcn-ui'

export const shadcnPreset = {
  content: [],
  plugins: [shadcnUIPlugin],
} satisfies Config
