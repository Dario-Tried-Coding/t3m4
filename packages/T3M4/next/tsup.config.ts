import { defineConfig } from 'tsup'
import fs from 'fs';
import path from 'path'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    types: 'src/types/index.ts',
  },
  sourcemap: false,
  minify: true,
  dts: true,
  clean: true,
  format: ['esm', 'cjs'],
  splitting: false,
  bundle: true,
  publicDir: true,
  esbuildPlugins: [
    {
      name: 'copy-iife',
      setup(build) {
        build.onEnd(() => {
          const from = path.resolve(__dirname, 'node_modules/@t3m4/react/dist/index.global.js')
          const to = path.resolve(__dirname, 'dist/index.global.js')

          if (fs.existsSync(from)) {
            fs.copyFileSync(from, to)
            console.log('[tsup] ✅ Copied index.global.js from react to next')
          } else console.warn('[tsup] ⚠️ IIFE not found in core/dist')
        })
      },
    },
  ],
})
