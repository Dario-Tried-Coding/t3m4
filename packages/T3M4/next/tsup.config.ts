import { defineConfig } from 'tsup'
import path from 'node:path'
import { cp } from 'node:fs/promises'

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
  onSuccess: async () => {
    try {
      const from = path.resolve(process.cwd(), 'node_modules/@t3m4/react/dist/scaffold')
      const to = path.resolve(process.cwd(), 'dist/scaffold')

      await cp(from, to, { recursive: true, force: true })
      console.log(`Scaffold files copied in ${to}`)
    } catch (error) {
      console.error('Error during scaffold files copy:', error)
    }
  },
})
