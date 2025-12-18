import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Base path should match your GitHub repository name
export default defineConfig({
  plugins: [react()],
  base: '/Legacy-Chat-Bot/',
})
