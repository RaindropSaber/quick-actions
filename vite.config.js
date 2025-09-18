import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { builtinModules } from 'module';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'out',
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.ts'),
        'webview/main': resolve(__dirname, 'src/webview/main.ts'),
      },
      output: [
        {
          format: 'esm',
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: 'webview/[name][extname]',
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
      ],
      preserveEntrySignatures: 'strict',
      external: ['vscode', ...builtinModules],
    },
    target: 'node20',
    minify: true,
    sourcemap: false,
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
