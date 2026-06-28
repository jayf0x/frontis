import react from '@vitejs/plugin-react';
import fs from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';

const __dir = new URL('.', import.meta.url).pathname;

function copyTypes() {
  const files = ['index.d.ts', 'globals.d.ts', 'react.d.ts'];
  return {
    name: 'copy-types',
    closeBundle() {
      for (const f of files) {
        fs.copyFileSync(resolve(__dir, `src/${f}`), resolve(__dir, `dist/${f}`));
      }
    },
  };
}


export default defineConfig({
  plugins: [copyTypes()],
  build: {
    lib: {
      // Two entry points, one package: `frontis` (core) and `frontis/react`.
      entry: {
        index: resolve(__dir, 'src/index.ts'),
        react: resolve(__dir, 'src/react.tsx'),
      },
      formats: ['es'],
    },
    minify: 'oxc',
    rollupOptions: {
      // Peer deps stay external — never bundled.
      external: ['react', 'react/jsx-runtime', 'react-dom', /^leva(\/|$)/],
    },
    sourcemap: false,
  },

  oxc: {
    drop: ['debugger'],
    pure: ['console.debug'],
  },
});
