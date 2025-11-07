import type { ESLintRuleModule } from '../types.js'
import { allRules } from 'ceviz'
import { createCevizContext } from '../index.js'

/**
 * ESLint wrapper for Ceviz's array-find-in-loop rule
 * Detects .find()/.filter()/.includes() inside loops causing O(n*m) complexity
 */
export const arrayFindInLoop: ESLintRuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect Array.find/filter/includes inside loops causing O(n*m) complexity',
      category: 'Performance',
      recommended: true,
      url: 'https://github.com/productdevbook/ceviz#array-find-in-loop',
    },
    messages: {
      arrayFindInLoop: '{{message}}',
    },
    schema: [],
  },

  create(context) {
    return {
      Program(node) {
        // Convert ESLint context to Ceviz context
        const cevizContext = createCevizContext(context)

        // Find the Ceviz rule
        const cevizRule = allRules.find(r => r.id === 'array-find-in-loop')
        if (!cevizRule)
          return

        // Run Ceviz rule
        const issues = cevizRule.check(cevizContext)

        // Convert Ceviz issues to ESLint reports
        issues.forEach((issue) => {
          context.report({
            node,
            messageId: 'arrayFindInLoop',
            data: { message: issue.message },
          })
        })
      },
    }
  },
}
