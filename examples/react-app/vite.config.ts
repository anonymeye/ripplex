import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ripple/core': path.resolve(__dirname, '../../packages/ripple/src/index.ts'),
      '@ripple/react': path.resolve(__dirname, '../../packages/ripple-react/src/index.ts'),
    },
  },
})

