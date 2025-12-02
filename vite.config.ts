import { defineConfig } from 'vite'

export default defineConfig({
  base: '/web-video-compressor/',
  build: {
    rollupOptions: {
      input: './index.html'
    }
  }
});
