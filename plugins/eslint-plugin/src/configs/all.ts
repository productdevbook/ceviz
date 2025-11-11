import type { Linter } from 'eslint'

export const all: Linter.FlatConfig = {
  name: 'ceviz:all',
  rules: {
    'ceviz/nested-loops': 'error',
    'ceviz/array-find-in-loop': 'error',
    'ceviz/memory-leak-interval': 'error',
    'ceviz/sync-file-operations': 'error',
    'ceviz/sequential-requests': 'warn',
  },
}
