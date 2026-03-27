import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production-ready Vite config
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
