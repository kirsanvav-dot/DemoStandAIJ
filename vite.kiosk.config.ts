import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Офлайн-сборка для стенда: один HTML-файл со всеми скриптами, стилями и шрифтами внутри.
// Открывается двойным кликом в браузере, без сервера и интернета.
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    outDir: 'dist-kiosk',
    assetsInlineLimit: 100_000_000,
  },
})
