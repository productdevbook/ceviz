import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import plugin from '../../src/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixturesDir = resolve(__dirname, '../fixtures')

async function lintFile(filePath: string, rules: Record<string, string>) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [{
      files: ['**/*.js'],
      plugins: { ceviz: plugin },
      rules,
    }],
  })

  const results = await eslint.lintFiles([filePath])
  return results[0]
}

describe('nested-loops rule', () => {
  it('detects nested loops', async () => {
    const result = await lintFile(
      resolve(fixturesDir, 'nested-loops.js'),
      { 'ceviz/nested-loops': 'error' },
    )

    expect(result.messages.length).toBeGreaterThan(0)
    expect(result.messages.some(m => m.message.includes('nested'))).toBe(true)
  })

  it('does not flag clean code', async () => {
    const result = await lintFile(
      resolve(fixturesDir, 'clean-code.js'),
      { 'ceviz/nested-loops': 'error' },
    )

    const nestedLoopMessages = result.messages.filter(m => m.ruleId === 'ceviz/nested-loops')
    expect(nestedLoopMessages.length).toBe(0)
  })

  it('reports line numbers correctly', async () => {
    const result = await lintFile(
      resolve(fixturesDir, 'nested-loops.js'),
      { 'ceviz/nested-loops': 'error' },
    )

    const messages = result.messages.filter(m => m.ruleId === 'ceviz/nested-loops')
    expect(messages.length).toBeGreaterThan(0)
    expect(messages[0].line).toBeGreaterThan(0)
  })
})

describe('array-find-in-loop rule', () => {
  it('detects array find/filter in loops', async () => {
    const result = await lintFile(
      resolve(fixturesDir, 'array-find-in-loop.js'),
      { 'ceviz/array-find-in-loop': 'error' },
    )

    expect(result.messages.length).toBeGreaterThan(0)
    expect(result.messages.some(m => m.message.toLowerCase().includes('find') || m.message.toLowerCase().includes('filter'))).toBe(true)
  })

  it('does not flag clean code', async () => {
    const result = await lintFile(
      resolve(fixturesDir, 'clean-code.js'),
      { 'ceviz/array-find-in-loop': 'error' },
    )

    const arrayFindMessages = result.messages.filter(m => m.ruleId === 'ceviz/array-find-in-loop')
    expect(arrayFindMessages.length).toBe(0)
  })
})

describe('memory-leak-interval rule', () => {
  it('detects setInterval without clearInterval', async () => {
    const result = await lintFile(
      resolve(fixturesDir, 'memory-leak-interval.js'),
      { 'ceviz/memory-leak-interval': 'error' },
    )

    expect(result.messages.length).toBeGreaterThan(0)
    expect(result.messages.some(m => m.message.toLowerCase().includes('interval') || m.message.toLowerCase().includes('leak'))).toBe(true)
  })

  it('does not flag clean code', async () => {
    const result = await lintFile(
      resolve(fixturesDir, 'clean-code.js'),
      { 'ceviz/memory-leak-interval': 'error' },
    )

    const memoryLeakMessages = result.messages.filter(m => m.ruleId === 'ceviz/memory-leak-interval')
    expect(memoryLeakMessages.length).toBe(0)
  })
})

describe('sync-file-operations rule', () => {
  it('detects synchronous file operations', async () => {
    const result = await lintFile(
      resolve(fixturesDir, 'sync-file-operations.js'),
      { 'ceviz/sync-file-operations': 'error' },
    )

    expect(result.messages.length).toBeGreaterThan(0)
    expect(result.messages.some(m => m.message.toLowerCase().includes('sync') || m.message.toLowerCase().includes('file'))).toBe(true)
  })

  it('does not flag clean code', async () => {
    const result = await lintFile(
      resolve(fixturesDir, 'clean-code.js'),
      { 'ceviz/sync-file-operations': 'error' },
    )

    const syncFileMessages = result.messages.filter(m => m.ruleId === 'ceviz/sync-file-operations')
    expect(syncFileMessages.length).toBe(0)
  })
})

describe('sequential-requests rule', () => {
  it('detects sequential async operations', async () => {
    const result = await lintFile(
      resolve(fixturesDir, 'sequential-requests.js'),
      { 'ceviz/sequential-requests': 'error' },
    )

    expect(result.messages.length).toBeGreaterThan(0)
    expect(result.messages.some(m => m.message.toLowerCase().includes('sequential') || m.message.toLowerCase().includes('await') || m.message.toLowerCase().includes('parallel'))).toBe(true)
  })

  it('does not flag clean code', async () => {
    const result = await lintFile(
      resolve(fixturesDir, 'clean-code.js'),
      { 'ceviz/sequential-requests': 'error' },
    )

    const sequentialMessages = result.messages.filter(m => m.ruleId === 'ceviz/sequential-requests')
    expect(sequentialMessages.length).toBe(0)
  })
})

describe('multiple issues in one file', () => {
  it('detects all issue types', async () => {
    const result = await lintFile(
      resolve(fixturesDir, 'multiple-issues.js'),
      {
        'ceviz/nested-loops': 'error',
        'ceviz/array-find-in-loop': 'error',
        'ceviz/memory-leak-interval': 'error',
        'ceviz/sync-file-operations': 'error',
        'ceviz/sequential-requests': 'error',
      },
    )

    expect(result.messages.length).toBeGreaterThan(4)

    const ruleIds = new Set(result.messages.map(m => m.ruleId))
    expect(ruleIds.size).toBeGreaterThan(3)
  })
})
