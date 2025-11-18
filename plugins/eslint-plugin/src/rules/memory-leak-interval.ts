import type { Rule } from 'eslint'
import { memoryLeakIntervalRule } from 'ceviz'
import { createCevizContext } from '../bridge.js'
import { convertIssueToMessage } from '../converter.js'

export const memoryLeakInterval: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detects unclosed intervals/timeouts causing memory leaks',
      category: 'Performance',
      recommended: true,
    },
    messages: {
      memoryLeak: '{{message}}',
    },
    schema: [],
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      Program() {
        try {
          const cevizContext = createCevizContext(context)
          const issues = memoryLeakIntervalRule.check(cevizContext)

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
