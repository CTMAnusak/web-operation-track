import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const appHost = 'demo-vtrack.vsquareclinic.com'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [appHost],
  },
  preview: {
    allowedHosts: [appHost],
  },
})