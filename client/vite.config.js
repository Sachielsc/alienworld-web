import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));

// Deployed at hobbies.seekschool.nz/alienworld/. Baked into every built asset URL, and
// mirrored by BASE_PATH in server/index.js, which mounts the app under the same prefix.
const base = '/alienworld/';

export default defineConfig({
  base,
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  server: {
    port: 5173,
    proxy: {
      // Express mounts under the same prefix, so this forwards the path unchanged.
      [`${base}api`]: 'http://localhost:3010',
    },
  },
});
