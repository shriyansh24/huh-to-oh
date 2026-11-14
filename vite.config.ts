import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLE=1 inlines every asset into one HTML file. ENTRY=404 builds the not-found page (404.html) instead of the
// home page; GitHub Pages serves dist/404.html for any URL that doesn't exist. Build the home page first: the 404
// build adds to dist/ instead of emptying it.
const entry = process.env.ENTRY === '404' ? '404.html' : 'index.html'
export default defineConfig({
  plugins: [react(), tailwindcss(), ...(process.env.SINGLE ? [viteSingleFile()] : [])],
  base: './',
  build: {
    assetsInlineLimit: process.env.SINGLE ? 100_000_000 : 4096,
    emptyOutDir: entry === 'index.html',
    rollupOptions: { input: entry },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    css: false,
  },
})
