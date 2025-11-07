import type { ESLintRuleModule } from '../types.js'
import { allRules } from 'ceviz'
import { createCevizContext } from '../index.js'

/**
 * ESLint wrapper for Ceviz's sync-file-operations rule
 * Detects synchronous file operations that block the event loop
 */
export const syncFileOperations: ESLintRuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect synchronous file operations that block the event loop',
      category: 'Performance',
      recommended: true,
      url: 'https://github.com/productdevbook/ceviz#sync-file-operations',
    },
    messages: {
      syncFileOperations: '{{message}}',
    },
    schema: [],
  },

  create(context) {
    return {
      Program(node) {
        const cevizContext = createCevizContext(context)
        const cevizRule = allRules.find(r => r.id === 'sync-file-operations')
        if (!cevizRule)
          return

        const issues = cevizRule.check(cevizContext)

        issues.forEach((issue) => {
          context.report({
            node,
            messageId: 'syncFileOperations',
            data: { message: issue.message },
          })
        })
      },
    }
  },
}
