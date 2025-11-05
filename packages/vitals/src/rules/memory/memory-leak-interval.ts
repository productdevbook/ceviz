import type { Rule, Issue, RuleContext } from '../../types.js'
import { getNodeLocation } from '../../utils/ast-helpers.js'

/**
 * Detect setInterval/setTimeout without clearInterval/clearTimeout
 * Common memory leak in Node.js and browser
 */
export const memoryLeakIntervalRule: Rule = {
  id: 'memory-leak-interval',
  name: 'Unclosed Interval/Timeout',
  category: 'memory',
  severity: 'critical',
  description: 'Detects setInterval/setTimeout without proper cleanup',
  enabled: true,
  check: (context: RuleContext): Issue[] => {
    const issues: Issue[] = []
    const { ast, filePath, code } = context

    const intervals: Set<string> = new Set()
    const cleared: Set<string> = new Set()

    const checkNode = (node: any, parent: any = null, scope: string = 'global'): void => {
      if (!node || typeof node !== 'object') return

      // Track setInterval/setTimeout calls
      if (node.type === 'CallExpression') {
        const callee = node.callee
        const calleeName = callee?.name || callee?.property?.name

        if (calleeName === 'setInterval' || calleeName === 'setTimeout') {
          const { line } = getNodeLocation(node, code)
          intervals.add(`${scope}:${line}`)
        }

        if (calleeName === 'clearInterval' || calleeName === 'clearTimeout') {
          const { line } = getNodeLocation(node, code)
          cleared.add(`${scope}:${line}`)
        }
      }

      // Check for cleanup in lifecycle hooks (Vue/React)
      if (node.type === 'CallExpression') {
        const calleeName = node.callee?.name

        // Vue: onUnmounted, onBeforeUnmount
        // React: useEffect return
        if (calleeName === 'onUnmounted' || calleeName === 'onBeforeUnmount') {
          // Assume cleanup happens here
          const callback = node.arguments?.[0]
          if (callback) {
            checkNode(callback, node, 'cleanup')
          }
        }
      }

      // Check all children
      for (const key in node) {
        if (key === 'type' || key === 'loc' || key === 'range') continue
        const value = node[key]
        if (Array.isArray(value)) {
          value.forEach(child => checkNode(child, node, scope))
        } else if (typeof value === 'object') {
          checkNode(value, node, scope)
        }
      }
    }

    checkNode(ast)

    // Find intervals that are never cleared
    for (const interval of intervals) {
      const [scope, lineStr] = interval.split(':')
      const line = parseInt(lineStr)

      // Check if there's any clear in the same scope or cleanup scope
      const hasCleanup = Array.from(cleared).some(c => {
        const [clearScope] = c.split(':')
        return clearScope === scope || clearScope === 'cleanup'
      })

      if (!hasCleanup) {
        const lines = code.split('\n')
        const codeSnippet = lines[line - 1] || ''

        issues.push({
          id: `memory-leak-interval-${line}`,
          rule: 'memory-leak-interval',
          severity: 'critical',
          category: 'memory',
          location: {
            file: filePath,
            line,
            column: 0,
          },
          message: 'setInterval/setTimeout without cleanup causes memory leak',
          description: 'This interval/timeout is never cleared, causing a memory leak. In components, this will accumulate on every mount/unmount cycle.',
          impact: {
            type: 'memory',
            level: 'extreme',
            estimate: 'Memory grows indefinitely, ~1-10MB per instance',
          },
          suggestion: {
            fix: 'Clear interval/timeout in cleanup lifecycle (onUnmounted, useEffect return, etc.)',
            example: context.isVue
              ? `// Vue:\nconst interval = setInterval(() => {...}, 1000)\nonUnmounted(() => {\n  clearInterval(interval)\n})`
              : `// React:\nuseEffect(() => {\n  const interval = setInterval(() => {...}, 1000)\n  return () => clearInterval(interval)\n}, [])`,
            docs: 'https://github.com/productdevbook/ceviz#memory-leak-interval',
          },
          autoFixable: false,
          codeSnippet: {
            before: codeSnippet.trim(),
            context: lines.slice(Math.max(0, line - 3), line + 2),
          },
        })
      }
    }

    return issues
  },
}
