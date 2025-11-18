import type { ESLint } from 'eslint'
import * as configs from './configs/index.js'
import * as rules from './rules/index.js'

const plugin: ESLint.Plugin = {
  meta: {
    name: 'eslint-plugin-ceviz',
    version: '0.0.3',
  },
  rules: {
    'nested-loops': rules.nestedLoops,
    'array-find-in-loop': rules.arrayFindInLoop,
    'memory-leak-interval': rules.memoryLeakInterval,
    'sync-file-operations': rules.syncFileOperations,
    'sequential-requests': rules.sequentialRequests,
  },
  configs: {
    recommended: configs.recommended,
    strict: configs.strict,
    all: configs.all,
  },
}

export default plugin
