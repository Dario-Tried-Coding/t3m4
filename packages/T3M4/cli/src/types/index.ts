import { LANGUAGES, MODULES } from '../constants'

export type PkgManager = 'npm' | 'pnpm' | 'yarn' | 'bun'
export type Module = (typeof MODULES)[number]
export type Language = (typeof LANGUAGES)[number]
