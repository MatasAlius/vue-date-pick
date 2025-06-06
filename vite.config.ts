import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@matasalius/VueDatePick',
      fileName: '@matasalius/vue-date-pick',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
