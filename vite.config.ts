import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Если в корне создан .env, загружаем его с override: true,
  // чтобы настройки из .env имели приоритет над неполными системными переменными.
  const envFile = path.resolve(__dirname, '.env');
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile, override: true });
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

