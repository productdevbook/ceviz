import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      ceviz: resolve(__dirname, '../..', 'src/dist/index.mjs'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
})
