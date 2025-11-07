import type { ESLintRuleModule } from '../types.js'
import { allRules } from 'ceviz'
import { createCevizContext } from '../index.js'

/**
 * ESLint wrapper for Ceviz's sequential-requests rule
 * Detects sequential async operations that could be parallelized
 */
export const sequentialRequests: ESLintRuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Detect sequential async calls that could be parallelized with Promise.all()',
      category: 'Performance',
      recommended: true,
      url: 'https://github.com/productdevbook/ceviz#sequential-requests',
    },
    messages: {
      sequentialRequests: '{{message}}',
    },
    schema: [],
  },

  create(context) {
    return {
      Program(node) {
        const cevizContext = createCevizContext(context)
        const cevizRule = allRules.find(r => r.id === 'sequential-requests')
        if (!cevizRule)
          return

        const issues = cevizRule.check(cevizContext)

        issues.forEach((issue) => {
          context.report({
            node,
            messageId: 'sequentialRequests',
            data: { message: issue.message },
          })
        })
      },
    }
  },
}
