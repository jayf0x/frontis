import react from '@vitejs/plugin-react';
import fs from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';

const __dir = new URL('.', import.meta.url).pathname;

function copyTypes() {
  return {
    name: 'copy-types',
    closeBundle() {
      fs.copyFileSync(resolve(__dir, 'src/index.d.ts'), resolve(__dir, 'dist/index.d.ts'));
      fs.copyFileSync(resolve(__dir, 'src/globals.d.ts'), resolve(__dir, 'dist/globals.d.ts'));
    },
  };
}


export default defineConfig({
  plugins: [copyTypes()],
  build: {
    lib: {
      entry: resolve(__dir, 'src/index.ts'),
      name: 'FluidityJS',
      fileName: 'index',
      formats: ['es'],
    },
    minify: 'oxc',
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: false,
  },

  oxc: {
    drop: ['debugger'],
    pure: ['console.debug'],
  },
});
