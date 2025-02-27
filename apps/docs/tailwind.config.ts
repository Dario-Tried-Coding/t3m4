import { shadcnPreset } from './src/lib/tailwind/presets/shadcn'
import { atomsPreset } from './src/lib/tailwind/presets/atoms'
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  presets: [shadcnPreset, atomsPreset],
} satisfies Config
