import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    // Build outputs
    '**/dist',
    '**/node_modules',
    '**/.pnpm-store',

    // Framework specific
    '**/.nuxt',
    '**/.output',
    '**/.nitro',
    '**/.netlify',
    '**/.vercel',

    // Test outputs
    '**/coverage',
    '**/.nyc_output',

    // Generated files
    '**/*.gen.*',
    '**/test-report.json',
    '**/final-test.json',
    '**/nuxt-test-report.json',

    // HTML reports
    '**/*-report.html',
    '**/*-analysis.html',

    // Test projects
    '**/examples/test-project/**',
    '**/examples/nuxt-test/**',
    '**/examples/eslint-playground/**',

    // Test fixtures (intentionally bad code)
    '**/test/fixtures/**',

    // Documentation
    'README.md',
    'CONTRIBUTING.md',
    'CLAUDE.md',
    'SUMMARY.md',
    'FRAMEWORK_ANALYSIS.md',
    'PLUGIN_API.md',
    '**/README.md',
  ],
}, {
  rules: {
    'node/prefer-global/process': 'off',
    'no-console': 'off', // Analyzer needs console output
    'no-new-func': 'off',
    'style/max-statements-per-line': 'off',
    'ts/ban-ts-comment': 'off', // Allow @ts-ignore for AST handling
  },
}, {
  files: [
    '**/test-project/**/*.{ts,js,mjs,cjs}',
    '**/nuxt-test/**/*.{ts,js,mjs,cjs}',
  ],
  rules: {
    'no-console': 'off',
    'unused-imports/no-unused-vars': 'off',
    'no-var': 'off',
    'prefer-const': 'off',
  },
})
