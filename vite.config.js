import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Ecoute sur toutes les interfaces reseau -> accessible depuis le telephone
    // connecte au meme Wi-Fi via http://IP_DU_PC:5173
    host: true,
    port: 5173,
    strictPort: true,
  },
})
