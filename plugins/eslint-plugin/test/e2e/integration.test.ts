import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import plugin from '../../src/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixturesDir = resolve(__dirname, '../fixtures')

describe('full integration tests', () => {
  it('plugin exports correct structure', () => {
    expect(plugin).toBeDefined()
    expect(plugin.meta).toBeDefined()
    expect(plugin.meta.name).toBe('eslint-plugin-ceviz')
    expect(plugin.meta.version).toBeDefined()
    expect(plugin.rules).toBeDefined()
    expect(plugin.configs).toBeDefined()
  })

  it('plugin has all expected rules', () => {
    const expectedRules = [
      'nested-loops',
      'array-find-in-loop',
      'memory-leak-interval',
      'sync-file-operations',
      'sequential-requests',
    ]

    for (const ruleName of expectedRules) {
      expect(plugin.rules![ruleName]).toBeDefined()
      expect(plugin.rules![ruleName].meta).toBeDefined()
      expect(plugin.rules![ruleName].create).toBeDefined()
    }
  })

  it('plugin has all expected configs', () => {
    expect(plugin.configs!.recommended).toBeDefined()
    expect(plugin.configs!.strict).toBeDefined()
    expect(plugin.configs!.all).toBeDefined()
  })

  it('rules have correct metadata', () => {
    const ruleNames = Object.keys(plugin.rules!)

    for (const ruleName of ruleNames) {
      const rule = plugin.rules![ruleName]
      expect(rule.meta.type).toBeDefined()
      expect(rule.meta.docs).toBeDefined()
      expect(rule.meta.docs.description).toBeDefined()
    }
  })

  it('can lint multiple files at once', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        files: ['**/*.js'],
        plugins: { ceviz: plugin },
        rules: {
          'ceviz/nested-loops': 'error',
          'ceviz/array-find-in-loop': 'error',
          'ceviz/memory-leak-interval': 'error',
          'ceviz/sync-file-operations': 'error',
          'ceviz/sequential-requests': 'error',
        },
      }],
    })

    const results = await eslint.lintFiles([
      resolve(fixturesDir, 'nested-loops.js'),
      resolve(fixturesDir, 'array-find-in-loop.js'),
      resolve(fixturesDir, 'clean-code.js'),
    ])

    expect(results.length).toBe(3)

    const nestedLoopsResult = results.find(r => r.filePath.includes('nested-loops.js'))
    const arrayFindResult = results.find(r => r.filePath.includes('array-find-in-loop.js'))
    const cleanCodeResult = results.find(r => r.filePath.includes('clean-code.js'))

    expect(nestedLoopsResult!.messages.length).toBeGreaterThan(0)
    expect(arrayFindResult!.messages.length).toBeGreaterThan(0)
    expect(cleanCodeResult!.errorCount).toBe(0)
  })

  it('preserves line and column information', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        files: ['**/*.js'],
        plugins: { ceviz: plugin },
        rules: { 'ceviz/nested-loops': 'error' },
      }],
    })

    const result = await eslint.lintFiles([resolve(fixturesDir, 'nested-loops.js')])

    for (const message of result[0].messages) {
      expect(message.line).toBeGreaterThan(0)
      expect(message.column).toBeGreaterThan(0)
    }
  })

  it('provides detailed error messages', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        files: ['**/*.js'],
        plugins: { ceviz: plugin },
        rules: { 'ceviz/nested-loops': 'error' },
      }],
    })

    const result = await eslint.lintFiles([resolve(fixturesDir, 'nested-loops.js')])
    const messages = result[0].messages.filter(m => m.ruleId === 'ceviz/nested-loops')

    expect(messages.length).toBeGreaterThan(0)
    expect(messages[0].message).toBeDefined()
    expect(messages[0].message.length).toBeGreaterThan(0)
  })

  it('can disable rules via file-level comments', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        files: ['**/*.js'],
        plugins: { ceviz: plugin },
        rules: {
          'ceviz/nested-loops': 'error',
          'ceviz/array-find-in-loop': 'error',
        },
      }],
    })

    const codeWithFileDisable = `
/* eslint-disable ceviz/nested-loops, ceviz/array-find-in-loop */
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    console.log(i, j)
  }
}

const users = []
for (const id of [1, 2, 3]) {
  const user = users.find(u => u.id === id)
}
`

    const results = await eslint.lintText(codeWithFileDisable, { filePath: 'test.js' })
    const cevizMessages = results[0].messages.filter(m => m.ruleId?.startsWith('ceviz/'))
    expect(cevizMessages.length).toBe(0)
  })

  it('handles TypeScript files', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        files: ['**/*.ts'],
        plugins: { ceviz: plugin },
        rules: { 'ceviz/nested-loops': 'error' },
      }],
    })

    const tsCode = `
function processData(items: string[], categories: string[]): void {
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < categories.length; j++) {
      console.log(items[i], categories[j])
    }
  }
}
`

    const results = await eslint.lintText(tsCode, { filePath: 'test.ts' })
    expect(results[0].messages.length).toBeGreaterThan(0)
  })

  it('reports correct rule IDs', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        files: ['**/*.js'],
        plugins: { ceviz: plugin },
        rules: {
          'ceviz/nested-loops': 'error',
          'ceviz/array-find-in-loop': 'error',
        },
      }],
    })

    const result = await eslint.lintFiles([resolve(fixturesDir, 'multiple-issues.js')])

    const ruleIds = result[0].messages.map(m => m.ruleId).filter(Boolean)
    expect(ruleIds.every(id => id!.startsWith('ceviz/'))).toBe(true)
  })

  it('handles files with no issues gracefully', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        files: ['**/*.js'],
        plugins: { ceviz: plugin },
        ...plugin.configs!.recommended,
      }],
    })

    const result = await eslint.lintFiles([resolve(fixturesDir, 'clean-code.js')])

    expect(result[0].messages.length).toBe(0)
    expect(result[0].errorCount).toBe(0)
    expect(result[0].warningCount).toBe(0)
  })

  it('respects rule configuration', async () => {
    const eslintWithWarn = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        files: ['**/*.js'],
        plugins: { ceviz: plugin },
        rules: { 'ceviz/nested-loops': 'warn' },
      }],
    })

    const eslintWithError = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        files: ['**/*.js'],
        plugins: { ceviz: plugin },
        rules: { 'ceviz/nested-loops': 'error' },
      }],
    })

    const warnResult = await eslintWithWarn.lintFiles([resolve(fixturesDir, 'nested-loops.js')])
    const errorResult = await eslintWithError.lintFiles([resolve(fixturesDir, 'nested-loops.js')])

    if (warnResult[0].messages.length > 0) {
      expect(warnResult[0].messages[0].severity).toBe(1)
    }

    if (errorResult[0].messages.length > 0) {
      expect(errorResult[0].messages[0].severity).toBe(2)
    }
  })
})
