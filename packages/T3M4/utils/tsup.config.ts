import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/nullables.ts', 'src/objects.ts'],
  sourcemap: false,
  minify: true,
  dts: true,
  clean: true,
  format: ['esm', 'cjs'],
  splitting: false,
  bundle: true,
})