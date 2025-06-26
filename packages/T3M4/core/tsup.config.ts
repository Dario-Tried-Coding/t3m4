import { defineConfig } from 'tsup'
import { promises as fs } from 'node:fs'
import { dirname } from 'node:path'

export default defineConfig(() => {
  return [
    {
      entry: ['src/index.ts'],
      format: 'iife',
      platform: 'browser',
      onSuccess: async () => {
        const dst = '../../../apps/docs/public'

        try {
          await fs.mkdir(dirname(dst), { recursive: true })
          await fs.copyFile('./dist/index.global.js', dst + '/index.global.js')
          console.log('Build successful, file copied to apps/docs/public/index.global.js')
        } catch (error) {
          console.error('Error during build or file copy:', error)
          throw error
        }
      },
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
  ]
})
