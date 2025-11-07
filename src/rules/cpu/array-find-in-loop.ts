import type { Issue, Rule, RuleContext } from '../../types.js'
import { getNodeLocation } from '../../utils/ast-helpers.js'

/**
 * Detect .find()/.filter()/.includes() inside loops
 * This creates O(n*m) complexity
 */
export const arrayFindInLoopRule: Rule = {
  id: 'array-find-in-loop',
  name: 'Array.find() in Loop',
  category: 'cpu',
  severity: 'critical',
  description: 'Detects Array.find/filter/includes inside loops causing O(n*m) complexity',
  enabled: true,
  check: (context: RuleContext): Issue[] => {
    const issues: Issue[] = []
    const { ast, filePath, code } = context

    const checkNode = (node: any, inLoop = false): void => {
      if (!node || typeof node !== 'object')
        return

      // Check if we're entering a loop
      const isLoop
        = node.type === 'ForStatement'
          || node.type === 'ForInStatement'
          || node.type === 'ForOfStatement'
          || node.type === 'WhileStatement'
          || node.type === 'DoWhileStatement'
          || (node.type === 'CallExpression' && isArrayIterator(node))

      const newInLoop = isLoop || inLoop

      // Check for expensive array operations inside loop
      if (newInLoop && node.type === 'CallExpression') {
        const callee = node.callee
        if (callee && callee.type === 'MemberExpression') {
          const methodName = callee.property?.name || callee.property?.value

          if (['find', 'filter', 'includes', 'indexOf', 'findIndex', 'some', 'every'].includes(methodName)) {
            const { line, column } = getNodeLocation(node, code)
            const lines = code.split('\n')
            const codeSnippet = lines[line - 1] || ''

            issues.push({
              id: `array-find-in-loop-${line}`,
              rule: 'array-find-in-loop',
              severity: 'critical',
              category: 'cpu',
              location: {
                file: filePath,
                line,
                column,
              },
              message: `Array.${methodName}() inside loop creates O(n*m) complexity`,
              description: `Using ${methodName}() inside a loop causes the array to be searched on every iteration, resulting in O(n*m) time complexity. This can be extremely slow for large datasets.`,
              impact: {
                type: 'cpu',
                level: 'high',
                complexity: 'O(n*m)',
                estimate: '10ms → 5s for 1000x1000 items',
              },
              suggestion: {
                fix: 'Convert array to Map/Set before the loop for O(1) lookups',
                example: `// Instead of:\nfor (const item of items) {\n  const match = array.${methodName}(x => x.id === item.id)\n}\n\n// Use:\nconst lookup = new Map(array.map(x => [x.id, x]))\nfor (const item of items) {\n  const match = lookup.get(item.id)\n}`,
                docs: 'https://github.com/productdevbook/ceviz#array-find-in-loop',
              },
              autoFixable: false,
              codeSnippet: {
                before: codeSnippet.trim(),
                context: lines.slice(Math.max(0, line - 3), line + 2),
              },
            })
          }
        }
      }

      // Recursively check children
      for (const key in node) {
        // Skip metadata properties and 'parent' (circular ref in ESLint AST)
        if (key === 'type' || key === 'loc' || key === 'range' || key === 'parent')
          continue
        const value = node[key]
        if (Array.isArray(value)) {
          value.forEach(child => checkNode(child, newInLoop))
        }
        else if (typeof value === 'object') {
          checkNode(value, newInLoop)
        }
      }
    }

    checkNode(ast)
    return issues
  },
}

function isArrayIterator(node: any): boolean {
  if (node.type !== 'CallExpression')
    return false
  const callee = node.callee
  if (!callee || callee.type !== 'MemberExpression')
    return false
  const methodName = callee.property?.name || callee.property?.value
  return ['forEach', 'map', 'filter', 'reduce'].includes(methodName)
}
