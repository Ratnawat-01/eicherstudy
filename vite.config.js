import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base must match your GitHub Pages repo name: https://ratnawat-01.github.io/eicherstudy/
export default defineConfig({
  plugins: [react()],
  base: '/eicherstudy/',
})
