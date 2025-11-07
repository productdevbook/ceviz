// ESLint Plugin for Ceviz
// This plugin provides ESLint rules for performance analysis powered by Ceviz

import * as configs from './configs/index.js'
// Export utilities for rule implementations
import { rules } from './rules/index.js'

export { createCevizContext } from './bridge.js'
export { countLoopDepth, getLocation, isArrayIterator, isLoop, issueToESLintReport } from './converter.js'
export * from './types.js'

export default {
  meta: {
    name: 'eslint-plugin-ceviz',
    version: '0.0.1',
  },
  rules,
  configs,
}
