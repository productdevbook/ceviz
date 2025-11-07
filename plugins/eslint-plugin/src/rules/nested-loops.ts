import type { ESLintRuleModule } from '../types.js'
import { allRules } from 'ceviz'
import { createCevizContext } from '../index.js'

/**
 * ESLint wrapper for Ceviz's nested-loops rule
 * Detects nested loops causing O(n²) or worse complexity
 */
export const nestedLoops: ESLintRuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect nested loops causing O(n²) or worse complexity',
      category: 'Performance',
      recommended: true,
      url: 'https://github.com/productdevbook/ceviz#nested-loops',
    },
    messages: {
      nestedLoops: '{{message}}',
    },
    schema: [],
  },

  create(context) {
    return {
      Program(node) {
        const cevizContext = createCevizContext(context)
        const cevizRule = allRules.find(r => r.id === 'nested-loops')
        if (!cevizRule)
          return

        const issues = cevizRule.check(cevizContext)

        issues.forEach((issue) => {
          context.report({
            node,
            messageId: 'nestedLoops',
            data: { message: issue.message },
          })
        })
      },
    }
  },
}
