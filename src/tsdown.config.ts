import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['index.ts', 'cli.ts'],
  format: ['esm'],
  clean: true,
  dts: true,
})
