import { defineConfig } from 'vite';
import { glob } from 'glob';
import injectHTML from 'vite-plugin-html-inject';
import FullReload from 'vite-plugin-full-reload';
import SortCss from 'postcss-sort-media-queries';

export default defineConfig(({ command }) => {
  return {
    define: {
      [command === 'serve' ? 'global' : '_global']: {},
    },
    root: 'src',  // Залишити root: 'src', оскільки index.html в папці src
    build: {
      sourcemap: true,
      rollupOptions: {
        input: glob.sync('./src/*.html'),  // Шлях до файлів HTML у папці src
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          entryFileNames: chunkInfo => {
            if (chunkInfo.name === 'commonHelpers') {
              return 'commonHelpers.js';
            }
            return '[name].js';
          },
          assetFileNames: assetInfo => {
            if (assetInfo.name && assetInfo.name.endsWith('.html')) {
              return '[name].[ext]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      outDir: '../dist',  // Залишити '../dist', щоб виходити з папки src в dist
      emptyOutDir: true,
    },
    optimizeDeps: {
      include: ['axios', 'izitoast', 'simplelightbox'],  // Додав оптимізацію для деяких залежностей
    },
    plugins: [
      injectHTML(),
      FullReload(['./src/**/**.html']),  // Спостерігаємо за змінами HTML у папці src
      SortCss({
        sort: 'mobile-first',
      }),
    ],
  };
});
