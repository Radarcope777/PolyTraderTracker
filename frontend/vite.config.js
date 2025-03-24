import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    hmr: {
      clientPort: 443
    },
    cors: true,
    // This is needed for Replit to work correctly
    strictPort: true,
    allowedHosts: ['localhost', '.replit.dev', '.repl.co', '.replit.app']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})