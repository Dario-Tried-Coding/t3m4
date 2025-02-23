import { preset } from './src/lib/tailwind/presets'
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['selector', '.dark'],
	content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
	presets: [preset]
} satisfies Config
