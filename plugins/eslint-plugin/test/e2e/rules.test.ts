import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import cevizPlugin from '../../src/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('eSLint Plugin Rules', () => {
  it('should detect array-find-in-loop violations', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        plugins: {
          ceviz: cevizPlugin,
        },
        rules: {
          'ceviz/array-find-in-loop': 'error',
        },
      }],
    })

    const fixturePath = join(__dirname, '../fixtures/array-find-in-loop.js')
    const results = await eslint.lintFiles([fixturePath])

    expect(results).toHaveLength(1)
    const result = results[0]

    // Should have 3 violations (badExample1, badExample2, badExample3)
    expect(result.messages).toHaveLength(3)

    // Check first violation (find in for loop)
    expect(result.messages[0].ruleId).toBe('ceviz/array-find-in-loop')
    expect(result.messages[0].message).toContain('Array.find()')
    expect(result.messages[0].severity).toBe(2) // error

    // Check second violation (filter in while loop)
    expect(result.messages[1].ruleId).toBe('ceviz/array-find-in-loop')
    expect(result.messages[1].message).toContain('Array.filter()')

    // Check third violation (includes in forEach)
    expect(result.messages[2].ruleId).toBe('ceviz/array-find-in-loop')
    expect(result.messages[2].message).toContain('Array.includes()')
  })

  it('should detect nested-loops violations', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        plugins: {
          ceviz: cevizPlugin,
        },
        rules: {
          'ceviz/nested-loops': 'error',
        },
      }],
    })

    const fixturePath = join(__dirname, '../fixtures/nested-loops.js')
    const results = await eslint.lintFiles([fixturePath])

    expect(results).toHaveLength(1)
    const result = results[0]

    // Should have 2 violations (badExample1 and badExample2)
    expect(result.messages).toHaveLength(2)

    // Check violations
    expect(result.messages[0].ruleId).toBe('ceviz/nested-loops')
    expect(result.messages[0].message).toContain('Nested loop')
    expect(result.messages[0].severity).toBe(2) // error

    expect(result.messages[1].ruleId).toBe('ceviz/nested-loops')
    expect(result.messages[1].message).toContain('Nested loop')
  })

  it('should detect memory-leak-interval violations', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        plugins: {
          ceviz: cevizPlugin,
        },
        rules: {
          'ceviz/memory-leak-interval': 'error',
        },
      }],
    })

    const fixturePath = join(__dirname, '../fixtures/memory-leak-interval.js')
    const results = await eslint.lintFiles([fixturePath])

    expect(results).toHaveLength(1)
    const result = results[0]

    // Should have 2 violations (badExample1 and badExample2)
    expect(result.messages).toHaveLength(2)

    // Check violations
    expect(result.messages[0].ruleId).toBe('ceviz/memory-leak-interval')
    expect(result.messages[0].message).toContain('setInterval')
    expect(result.messages[0].severity).toBe(2)

    expect(result.messages[1].ruleId).toBe('ceviz/memory-leak-interval')
    expect(result.messages[1].message).toContain('setTimeout')
  })

  it('should detect sequential-requests violations', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        plugins: {
          ceviz: cevizPlugin,
        },
        rules: {
          'ceviz/sequential-requests': 'error',
        },
      }],
    })

    const fixturePath = join(__dirname, '../fixtures/sequential-requests.js')
    const results = await eslint.lintFiles([fixturePath])

    expect(results).toHaveLength(1)
    const result = results[0]

    // Should have at least 1 violation (badExample1 with 3 sequential awaits)
    expect(result.messages.length).toBeGreaterThanOrEqual(1)

    expect(result.messages[0].ruleId).toBe('ceviz/sequential-requests')
    expect(result.messages[0].message).toContain('sequential')
    expect(result.messages[0].severity).toBe(2)
  })

  it('should detect sync-file-operations violations', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        plugins: {
          ceviz: cevizPlugin,
        },
        rules: {
          'ceviz/sync-file-operations': 'error',
        },
      }],
    })

    const fixturePath = join(__dirname, '../fixtures/sync-file-operations.js')
    const results = await eslint.lintFiles([fixturePath])

    expect(results).toHaveLength(1)
    const result = results[0]

    // Should have 2 violations (readFileSync and writeFileSync)
    expect(result.messages).toHaveLength(2)

    expect(result.messages[0].ruleId).toBe('ceviz/sync-file-operations')
    expect(result.messages[0].message).toContain('Sync')
    expect(result.messages[0].severity).toBe(2)

    expect(result.messages[1].ruleId).toBe('ceviz/sync-file-operations')
    expect(result.messages[1].message).toContain('Sync')
  })
})
