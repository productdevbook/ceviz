/**
 * Strict config - all performance rules as errors
 * Use with: { plugins: { ceviz }, ...cevizPlugin.configs.strict }
 */
export const strict = {
  name: 'ceviz/strict',
  rules: {
    'ceviz/array-find-in-loop': 'error',
    'ceviz/nested-loops': 'error',
    'ceviz/memory-leak-interval': 'error',
    'ceviz/sequential-requests': 'error',
    'ceviz/sync-file-operations': 'error',
  },
}
