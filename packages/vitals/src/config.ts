import type { VitalsConfig } from './types.js'
import { loadConfig } from 'c12'

/**
 * Define Ceviz configuration with type safety
 *
 * @example
 * ```ts
 * // ceviz.config.ts
 * import { defineConfig } from 'ceviz'
 *
 * export default defineConfig({
 *   plugins: ['ceviz-plugin-vue'],
 *   rules: {
 *     'nested-loops': 'error',
 *     'no-console-log': 'off'
 *   }
 * })
 * ```
 */
export function defineConfig(config: VitalsConfig): VitalsConfig {
  return config
}

/**
 * Load Ceviz configuration from ceviz.config.ts/js/mjs
 */
export async function resolveConfig(cwd: string = process.cwd()): Promise<VitalsConfig> {
  const { config = {} } = await loadConfig<VitalsConfig>({
    cwd,
    name: 'ceviz',
    configFile: 'ceviz.config',
    defaults: {
      plugins: [],
      rules: {},
      reporters: ['console'],
      scanDeps: false,
      targetDeps: [],
    },
    // Support both .ts and .js config files
    rcFile: false,
    globalRc: false,
  })

  return config as VitalsConfig
}

/**
 * Merge CLI options with config file
 */
export function mergeConfig(
  fileConfig: VitalsConfig,
  cliOptions: Partial<VitalsConfig>
): VitalsConfig {
  return {
    ...fileConfig,
    ...cliOptions,
    plugins: cliOptions.plugins || fileConfig.plugins || [],
    rules: { ...fileConfig.rules, ...cliOptions.rules },
    reporters: cliOptions.reporters || fileConfig.reporters || ['console'],
    scanDeps: cliOptions.scanDeps ?? fileConfig.scanDeps ?? false,
    targetDeps: cliOptions.targetDeps || fileConfig.targetDeps || [],
  }
}
