import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import cevizPlugin from '../../src/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('eSLint Plugin Configs', () => {
  it('should have recommended config', () => {
    expect(cevizPlugin.configs).toBeDefined()
    expect(cevizPlugin.configs.recommended).toBeDefined()
    expect(cevizPlugin.configs.recommended.name).toBe('ceviz/recommended')
    expect(cevizPlugin.configs.recommended.rules).toBeDefined()
  })

  it('should have strict config', () => {
    expect(cevizPlugin.configs.strict).toBeDefined()
    expect(cevizPlugin.configs.strict.name).toBe('ceviz/strict')
    expect(cevizPlugin.configs.strict.rules).toBeDefined()
  })

  it('should have all config', () => {
    expect(cevizPlugin.configs.all).toBeDefined()
    expect(cevizPlugin.configs.all.name).toBe('ceviz/all')
    expect(cevizPlugin.configs.all.rules).toBeDefined()
  })

  it('recommended config should enable critical rules', () => {
    const { rules } = cevizPlugin.configs.recommended
    expect(rules['ceviz/array-find-in-loop']).toBe('warn')
    expect(rules['ceviz/nested-loops']).toBe('warn')
    expect(rules['ceviz/memory-leak-interval']).toBe('error')
    expect(rules['ceviz/sequential-requests']).toBe('warn')
  })

  it('strict config should set all rules to error', () => {
    const { rules } = cevizPlugin.configs.strict
    expect(rules['ceviz/array-find-in-loop']).toBe('error')
    expect(rules['ceviz/nested-loops']).toBe('error')
    expect(rules['ceviz/memory-leak-interval']).toBe('error')
    expect(rules['ceviz/sequential-requests']).toBe('error')
    expect(rules['ceviz/sync-file-operations']).toBe('error')
  })

  it('all config should enable all rules as warnings', () => {
    const { rules } = cevizPlugin.configs.all
    expect(rules['ceviz/array-find-in-loop']).toBe('warn')
    expect(rules['ceviz/nested-loops']).toBe('warn')
    expect(rules['ceviz/memory-leak-interval']).toBe('warn')
    expect(rules['ceviz/sequential-requests']).toBe('warn')
    expect(rules['ceviz/sync-file-operations']).toBe('warn')
  })

  it('should apply recommended config to ESLint', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        plugins: {
          ceviz: cevizPlugin,
        },
        ...cevizPlugin.configs.recommended,
      }],
    })

    const fixturePath = join(__dirname, '../fixtures/array-find-in-loop.js')
    const results = await eslint.lintFiles([fixturePath])

    expect(results).toHaveLength(1)
    const result = results[0]

    // Should detect violations with recommended config
    expect(result.messages.length).toBeGreaterThan(0)
    expect(result.messages[0].ruleId).toBe('ceviz/array-find-in-loop')
    // Warning severity (1) since recommended uses 'warn'
    expect(result.messages[0].severity).toBe(1)
  })

  it('should apply strict config to ESLint', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        plugins: {
          ceviz: cevizPlugin,
        },
        ...cevizPlugin.configs.strict,
      }],
    })

    const fixturePath = join(__dirname, '../fixtures/array-find-in-loop.js')
    const results = await eslint.lintFiles([fixturePath])

    expect(results).toHaveLength(1)
    const result = results[0]

    // Should detect violations with strict config
    expect(result.messages.length).toBeGreaterThan(0)
    expect(result.messages[0].ruleId).toBe('ceviz/array-find-in-loop')
    // Error severity (2) since strict uses 'error'
    expect(result.messages[0].severity).toBe(2)
  })
})
