import ceviz from 'eslint-plugin-ceviz'

export default [
  {
    plugins: { ceviz },
    rules: {
      'ceviz/array-find-in-loop': 'error',
      'ceviz/nested-loops': 'error',
      'ceviz/memory-leak-interval': 'error',
      'ceviz/sequential-requests': 'error',
      'ceviz/sync-file-operations': 'error',
    },
  },
]
