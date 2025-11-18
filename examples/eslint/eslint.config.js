import ceviz from 'eslint-plugin-ceviz'

export default [
  {
    files: ['rules-demo.js'],
    plugins: { ceviz },
    rules: {
      ...ceviz.configs.recommended.rules,
    },
  },
]
