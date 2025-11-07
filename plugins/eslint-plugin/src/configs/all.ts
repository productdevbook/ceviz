/**
 * All config - enables all rules as warnings
 * Use with: { plugins: { ceviz }, ...cevizPlugin.configs.all }
 */
export const all = {
  name: 'ceviz/all',
  rules: {
    'ceviz/array-find-in-loop': 'warn',
    'ceviz/nested-loops': 'warn',
    'ceviz/memory-leak-interval': 'warn',
    'ceviz/sequential-requests': 'warn',
    'ceviz/sync-file-operations': 'warn',
  },
}
