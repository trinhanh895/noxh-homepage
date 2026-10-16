import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative asset paths so the build also works from a sub-path (e.g. a hosted artifact)
  base: './',
  plugins: [react(), tailwindcss()],
})
