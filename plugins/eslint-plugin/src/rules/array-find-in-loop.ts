import type { Rule } from 'eslint'
import { arrayFindInLoopRule } from 'ceviz'
import { createCevizContext } from '../bridge.js'
import { convertIssueToMessage } from '../converter.js'

export const arrayFindInLoop: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detects array.find() inside loops creating O(n*m) complexity',
      category: 'Performance',
      recommended: true,
    },
    messages: {
      arrayFindInLoop: '{{message}}',
    },
    schema: [],
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      Program() {
        try {
          const cevizContext = createCevizContext(context)
          const issues = arrayFindInLoopRule.check(cevizContext)

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
