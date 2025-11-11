import type { Rule } from 'eslint'
import { sequentialRequestsRule } from 'ceviz-core'
import { createCevizContext } from '../bridge.js'
import { convertIssueToMessage } from '../converter.js'

export const sequentialRequests: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Detects sequential async operations that could be parallelized',
      category: 'Performance',
      recommended: true,
    },
    messages: {
      sequentialRequests: '{{message}}',
    },
    schema: [],
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      Program() {
        try {
          const cevizContext = createCevizContext(context)
          const issues = sequentialRequestsRule.check(cevizContext)

          for (const issue of issues) {
            const eslintMessage = convertIssueToMessage(issue)
            context.report({
              loc: {
                start: { line: eslintMessage.line, column: eslintMessage.column },
                end: eslintMessage.endLine && eslintMessage.endColumn
                  ? { line: eslintMessage.endLine, column: eslintMessage.endColumn }
                  : { line: eslintMessage.line, column: eslintMessage.column + 1 },
              },
              message: eslintMessage.message,
            })
          }
        }
        catch {
        }
      },
    }
  },
}
