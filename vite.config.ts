import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLE=1 inlines every asset into dist/index.html (the published artifact and the open-from-disk copy).
export default defineConfig({
  plugins: [react(), tailwindcss(), ...(process.env.SINGLE ? [viteSingleFile()] : [])],
  base: './',
  build: { assetsInlineLimit: process.env.SINGLE ? 100_000_000 : 4096 },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    css: false,
  },
})
