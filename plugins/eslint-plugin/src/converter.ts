import type { ESLintReportDescriptor, Issue } from './types.js'

/**
 * Converter: Transform Ceviz issues to ESLint reports
 */

/**
 * Convert Ceviz Issue to ESLint report descriptor
 */
export function issueToESLintReport(issue: Issue, node: any): ESLintReportDescriptor {
  return {
    node,
    message: `${issue.message} (${issue.impact.complexity || issue.impact.level})`,
    data: {
      suggestion: issue.suggestion?.fix,
      impact: issue.impact.estimate,
    },
  }
}

/**
 * Check if node is a loop construct
 */
export function isLoop(node: any): boolean {
  return node.type === 'ForStatement'
    || node.type === 'ForInStatement'
    || node.type === 'ForOfStatement'
    || node.type === 'WhileStatement'
    || node.type === 'DoWhileStatement'
}

/**
 * Check if node is an array iterator method
 */
export function isArrayIterator(node: any): boolean {
  if (node.type !== 'CallExpression')
    return false

  const callee = node.callee
  if (!callee || callee.type !== 'MemberExpression')
    return false

  const property = callee.property
  if (!property)
    return false

  const methodName = property.name || property.value
  return ['forEach', 'map', 'filter', 'reduce', 'find', 'some', 'every'].includes(methodName)
}

/**
 * Get line and column from ESLint AST node
 */
export function getLocation(node: any): { line: number, column: number } {
  if (node.loc?.start) {
    return {
      line: node.loc.start.line,
      column: node.loc.start.column,
    }
  }
  return { line: 1, column: 0 }
}

/**
 * Check if node is inside a loop (for nested loop detection)
 */
export function countLoopDepth(node: any, visited = new Set()): number {
  if (!node || visited.has(node))
    return 0

  visited.add(node)

  if (isLoop(node) || isArrayIterator(node))
    return 1 + (node.parent ? countLoopDepth(node.parent, visited) : 0)

  return node.parent ? countLoopDepth(node.parent, visited) : 0
}
