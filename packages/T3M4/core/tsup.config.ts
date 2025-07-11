import { defineConfig } from 'tsup'

export default defineConfig(() => {
  return [
    {
      entry: {
        index: 'src/index.ts',
        'types/index': 'src/types/exports/index.ts',
        'types/constants': 'src/types/exports/constants.ts',
        'types/subscribers': 'src/types/exports/subscribers.ts',
      },
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
