import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  tsconfig: './tsconfig.json',
  external: ['react', '@rplx/core'],
})

