import type { Rule, Issue, RuleContext } from '../../types.js'
import { getNodeLocation } from '../../utils/ast-helpers.js'

/**
 * Detect nested loops (O(n²) or worse)
 * This is one of the MOST COMMON performance killers in Node.js
 */
export const nestedLoopsRule: Rule = {
  id: 'nested-loops',
  name: 'Nested Loops Detection',
  category: 'cpu',
  severity: 'critical',
  description: 'Detects nested loops that cause O(n²) or worse complexity',
  enabled: true,
  check: (context: RuleContext): Issue[] => {
    const issues: Issue[] = []
    const { ast, filePath, code } = context

    const checkNode = (node: any, loopDepth = 0): void => {
      if (!node || typeof node !== 'object') return

      // Check if this is a loop
      const isLoop =
        node.type === 'ForStatement' ||
        node.type === 'ForInStatement' ||
        node.type === 'ForOfStatement' ||
        node.type === 'WhileStatement' ||
        node.type === 'DoWhileStatement' ||
        (node.type === 'CallExpression' && isArrayIterator(node))

      const newDepth = isLoop ? loopDepth + 1 : loopDepth

      // If we're 2+ levels deep, it's O(n²) or worse
      if (newDepth >= 2 && isLoop) {
        const { line, column } = getNodeLocation(node, code)

        // Get the code snippet
        const lines = code.split('\n')
        const codeSnippet = lines[line - 1] || ''

        let complexity = `O(n²)`
        if (newDepth === 3) complexity = 'O(n³)'
        if (newDepth > 3) complexity = `O(n^${newDepth})`

        issues.push({
          id: `nested-loops-${line}`,
          rule: 'nested-loops',
          severity: newDepth === 2 ? 'critical' : 'critical',
          category: 'cpu',
          location: {
            file: filePath,
            line,
            column,
          },
          message: `Nested loop detected (${complexity} complexity)`,
          description: `This code has ${newDepth} nested loops, resulting in ${complexity} time complexity. For large datasets, this can cause severe performance issues.`,
          impact: {
            type: 'cpu',
            level: newDepth === 2 ? 'high' : 'extreme',
            complexity,
            estimate: newDepth === 2
              ? '100ms → 10s for 1000 items'
              : '100ms → 100s+ for 1000 items',
          },
          suggestion: {
            fix: 'Use Map/Set for O(1) lookups instead of nested loops',
            example: `// Instead of:\nfor (const user of users) {\n  for (const post of posts) {\n    if (post.userId === user.id) { ... }\n  }\n}\n\n// Use:\nconst postsByUser = new Map()\nfor (const post of posts) {\n  if (!postsByUser.has(post.userId)) {\n    postsByUser.set(post.userId, [])\n  }\n  postsByUser.get(post.userId).push(post)\n}\nfor (const user of users) {\n  const userPosts = postsByUser.get(user.id) || []\n  // ...\n}`,
            docs: 'https://github.com/productdevbook/ceviz#nested-loops',
          },
          autoFixable: false,
          codeSnippet: {
            before: codeSnippet.trim(),
            context: lines.slice(Math.max(0, line - 3), line + 2),
          },
        })
      }

      // Recursively check all child nodes
      for (const key in node) {
        if (key === 'type' || key === 'loc' || key === 'range') continue
        const value = node[key]
        if (Array.isArray(value)) {
          value.forEach(child => checkNode(child, newDepth))
        } else if (typeof value === 'object') {
          checkNode(value, newDepth)
        }
      }
    }

    checkNode(ast)
    return issues
  },
}

function isArrayIterator(node: any): boolean {
  if (node.type !== 'CallExpression') return false

  const callee = node.callee
  if (!callee || callee.type !== 'MemberExpression') return false

  const property = callee.property
  if (!property) return false

  const methodName = property.name || property.value
  return ['forEach', 'map', 'filter', 'reduce', 'find', 'some', 'every'].includes(methodName)
}
