import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configurações do Vite para o ÉLITE WOMEN STUDIO
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Reduz o tamanho dos arquivos gerados
    minify: 'esbuild',
    // Lazy loading natural das rotas feito pelo React Router
  },
  server: {
    port: 3000,
    open: false,
  },
})
