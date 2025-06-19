import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: 'iife',
    platform: 'browser',
    outDir: process.env.NODE_ENV === 'production' ? 'dist' : '../../../apps/docs/public'
  },
  {
    entry: ['src/types/exports/index.ts', 'src/types/exports/constants.ts', 'src/types/exports/subscribers.ts'],
    sourcemap: false,
    minify: true,
    dts: true,
    clean: true,
    format: ['esm', 'cjs'],
    splitting: false,
    bundle: true,
  },
])
