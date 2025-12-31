import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@rplx/core': path.resolve(__dirname, '../../packages/ripplex/src/index.ts'),
      '@rplx/react': path.resolve(__dirname, '../../packages/ripplex-react/src/index.ts'),
    },
  },
})

