import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/msab-r-and-d-ui/' : '/',
  plugins: [react()],
}))
