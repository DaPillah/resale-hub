import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Change '/resale-hub/' to match your GitHub repo name exactly
  base: '/resale-hub/',
})
