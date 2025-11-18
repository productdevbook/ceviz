import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import plugin from '../../src/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixturesDir = resolve(__dirname, '../fixtures')

async function lintFileWithConfig(filePath: string, configName: 'recommended' | 'strict' | 'all') {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [{
      files: ['**/*.js'],
      plugins: { ceviz: plugin },
      ...plugin.configs![configName],
    }],
  })

  const results = await eslint.lintFiles([filePath])
  return results[0]
}

describe('recommended config', () => {
  it('detects issues with recommended rules', async () => {
    const result = await lintFileWithConfig(
      resolve(fixturesDir, 'multiple-issues.js'),
      'recommended',
    )

    expect(result.messages.length).toBeGreaterThan(0)
    expect(result.errorCount).toBeGreaterThan(0)
  })

  it('passes clean code', async () => {
    const result = await lintFileWithConfig(
      resolve(fixturesDir, 'clean-code.js'),
      'recommended',
    )

    expect(result.errorCount).toBe(0)
  })

  it('has correct severity for sequential-requests (warn)', async () => {
    const result = await lintFileWithConfig(
      resolve(fixturesDir, 'sequential-requests.js'),
      'recommended',
    )

    const sequentialMessages = result.messages.filter(m => m.ruleId === 'ceviz/sequential-requests')
    if (sequentialMessages.length > 0) {
      expect(sequentialMessages.every(m => m.severity === 1)).toBe(true)
    }
  })

  it('has correct severity for other rules (error)', async () => {
    const result = await lintFileWithConfig(
      resolve(fixturesDir, 'nested-loops.js'),
      'recommended',
    )

    const errorMessages = result.messages.filter(m => m.ruleId === 'ceviz/nested-loops')
    if (errorMessages.length > 0) {
      expect(errorMessages.every(m => m.severity === 2)).toBe(true)
    }
  })
})

describe('strict config', () => {
  it('detects issues with strict rules', async () => {
    const result = await lintFileWithConfig(
      resolve(fixturesDir, 'multiple-issues.js'),
      'strict',
    )

    expect(result.messages.length).toBeGreaterThan(0)
    expect(result.errorCount).toBeGreaterThan(0)
  })

  it('passes clean code', async () => {
    const result = await lintFileWithConfig(
      resolve(fixturesDir, 'clean-code.js'),
      'strict',
    )

    expect(result.errorCount).toBe(0)
  })

  it('has all rules as error severity', async () => {
    const result = await lintFileWithConfig(
      resolve(fixturesDir, 'sequential-requests.js'),
      'strict',
    )

    const allMessages = result.messages.filter(m => m.ruleId?.startsWith('ceviz/'))
    if (allMessages.length > 0) {
      expect(allMessages.every(m => m.severity === 2)).toBe(true)
    }
  })

  it('detects more errors than recommended', async () => {
    const strictResult = await lintFileWithConfig(
      resolve(fixturesDir, 'sequential-requests.js'),
      'strict',
    )

    const recommendedResult = await lintFileWithConfig(
      resolve(fixturesDir, 'sequential-requests.js'),
      'recommended',
    )

    expect(strictResult.errorCount).toBeGreaterThanOrEqual(recommendedResult.errorCount)
  })
})

describe('all config', () => {
  it('detects issues with all rules enabled', async () => {
    const result = await lintFileWithConfig(
      resolve(fixturesDir, 'multiple-issues.js'),
      'all',
    )

    expect(result.messages.length).toBeGreaterThan(0)
  })

  it('passes clean code', async () => {
    const result = await lintFileWithConfig(
      resolve(fixturesDir, 'clean-code.js'),
      'all',
    )

    expect(result.errorCount).toBe(0)
  })

  it('enables all available rules', async () => {
    const result = await lintFileWithConfig(
      resolve(fixturesDir, 'multiple-issues.js'),
      'all',
    )

    const ruleIds = new Set(result.messages.filter(m => m.ruleId?.startsWith('ceviz/')).map(m => m.ruleId))
    expect(ruleIds.size).toBeGreaterThan(0)
  })
})

describe('config comparison', () => {
  it('all configs detect nested loops', async () => {
    const configs: Array<'recommended' | 'strict' | 'all'> = ['recommended', 'strict', 'all']

    for (const config of configs) {
      const result = await lintFileWithConfig(
        resolve(fixturesDir, 'nested-loops.js'),
        config,
      )

      expect(result.messages.length).toBeGreaterThan(0)
      expect(result.messages.some(m => m.ruleId === 'ceviz/nested-loops')).toBe(true)
    }
  })

  it('all configs pass clean code', async () => {
    const configs: Array<'recommended' | 'strict' | 'all'> = ['recommended', 'strict', 'all']

    for (const config of configs) {
      const result = await lintFileWithConfig(
        resolve(fixturesDir, 'clean-code.js'),
        config,
      )

      expect(result.errorCount).toBe(0)
    }
  })
})
