import ceviz from 'eslint-plugin-ceviz'

export default [
  {
    files: ['**/*.js'],
    plugins: { ceviz },
    rules: {
      ...ceviz.configs.recommended.rules,
    },
  },
]
