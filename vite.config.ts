import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base relative : le site fonctionne depuis n'importe quel dossier (GitHub Pages, serveur, clé USB)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    assetsDir: 'static',
    chunkSizeWarningLimit: 1800,
  },
})
