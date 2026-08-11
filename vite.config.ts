import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config
export default defineConfig({
    root: new URL('src/renderer/src', import.meta.url).pathname,
    publicDir: new URL('public', import.meta.url).pathname,
    plugins: [react(), tailwindcss(), svgr()],
})
