import { defineConfig } from 'vite';

export default defineConfig({
  // 动态设置base：开发环境使用相对路径，生产环境使用GitHub Pages仓库名
  base: process.env.NODE_ENV === 'production' ? '/web-video-compressor/' : './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
});
