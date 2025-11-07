/**
 * Recommended config - enables critical performance rules
 * Use with: { plugins: { ceviz }, ...cevizPlugin.configs.recommended }
 */
export const recommended = {
  name: 'ceviz/recommended',
  rules: {
    'ceviz/array-find-in-loop': 'warn',
    'ceviz/nested-loops': 'warn',
    'ceviz/memory-leak-interval': 'error',
    'ceviz/sequential-requests': 'warn',
  },
}
