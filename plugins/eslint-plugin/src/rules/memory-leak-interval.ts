import type { ESLintRuleModule } from '../types.js'
import { allRules } from 'ceviz'
import { createCevizContext } from '../index.js'

/**
 * ESLint wrapper for Ceviz's memory-leak-interval rule
 * Detects setInterval/setTimeout without cleanup
 */
export const memoryLeakInterval: ESLintRuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect setInterval/setTimeout without proper cleanup',
      category: 'Memory',
      recommended: true,
      url: 'https://github.com/productdevbook/ceviz#memory-leak-interval',
    },
    messages: {
      memoryLeakInterval: '{{message}}',
    },
    schema: [],
  },

  create(context) {
    return {
      Program(node) {
        const cevizContext = createCevizContext(context)
        const cevizRule = allRules.find(r => r.id === 'memory-leak-interval')
        if (!cevizRule)
          return

        const issues = cevizRule.check(cevizContext)

        issues.forEach((issue) => {
          context.report({
            node,
            messageId: 'memoryLeakInterval',
            data: { message: issue.message },
          })
        })
      },
    }
  },
}
