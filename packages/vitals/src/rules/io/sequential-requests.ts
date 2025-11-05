import type { Rule, Issue, RuleContext } from '../../types.js'

/**
 * Detect sequential async operations that could be parallelized
 * Waterfall pattern is very common and wastes time
 */
export const sequentialRequestsRule: Rule = {
  id: 'sequential-requests',
  name: 'Sequential Async Operations',
  category: 'io',
  severity: 'warning',
  description: 'Detects sequential async calls that could be parallelized with Promise.all()',
  enabled: true,
  check: (context: RuleContext): Issue[] => {
    const issues: Issue[] = []
    const { ast, filePath, code } = context

    const checkNode = (node: any, parent: any = null): void => {
      if (!node || typeof node !== 'object') return

      // Look for consecutive await statements
      if (node.type === 'BlockStatement' || node.type === 'Program') {
        const body = node.body || []
        const awaitStatements: any[] = []

        for (let i = 0; i < body.length; i++) {
          const stmt = body[i]

          // Check if this statement contains an await
          if (containsAwait(stmt)) {
            awaitStatements.push({ stmt, index: i })
          } else if (awaitStatements.length > 0) {
            // Non-await statement breaks the sequence
            if (awaitStatements.length >= 2) {
              // Found a sequence of 2+ awaits
              reportSequence(awaitStatements)
            }
            awaitStatements.length = 0
          }
        }

        // Check final sequence
        if (awaitStatements.length >= 2) {
          reportSequence(awaitStatements)
        }
      }

      // Recurse
      for (const key in node) {
        if (key === 'type' || key === 'loc' || key === 'range') continue
        const value = node[key]
        if (Array.isArray(value)) {
          value.forEach(child => checkNode(child, node))
        } else if (typeof value === 'object') {
          checkNode(value, node)
        }
      }
    }

    function containsAwait(node: any): boolean {
      if (!node) return false
      if (node.type === 'AwaitExpression') return true

      for (const key in node) {
        if (key === 'type' || key === 'loc' || key === 'range') continue
        const value = node[key]
        if (Array.isArray(value)) {
          if (value.some(containsAwait)) return true
        } else if (typeof value === 'object') {
          if (containsAwait(value)) return true
        }
      }
      return false
    }

    function checkIfIndependent(statements: any[]): boolean {
      // Simple heuristic: if variable names don't overlap, likely independent
      // This is simplified - a real implementation would do data flow analysis
      const variables = new Set<string>()
      let hasConflict = false

      for (const { stmt } of statements) {
        const declared = getLeftHandVariables(stmt)
        const used = getRightHandVariables(stmt)

        // Check if this statement uses variables from previous statements
        for (const v of used) {
          if (variables.has(v)) {
            hasConflict = true
            break
          }
        }

        // Add declared variables
        for (const v of declared) {
          variables.add(v)
        }
      }

      return !hasConflict
    }

    function getLeftHandVariables(node: any): Set<string> {
      const vars = new Set<string>()

      if (node.type === 'VariableDeclaration') {
        for (const decl of node.declarations || []) {
          if (decl.id?.type === 'Identifier') {
            vars.add(decl.id.name)
          }
        }
      }

      return vars
    }

    function getRightHandVariables(node: any): Set<string> {
      const vars = new Set<string>()

      const extract = (n: any): void => {
        if (!n) return
        if (n.type === 'Identifier') {
          vars.add(n.name)
        }
        for (const key in n) {
          if (key === 'type' || key === 'loc' || key === 'range' || key === 'id') continue
          const value = n[key]
          if (Array.isArray(value)) {
            value.forEach(extract)
          } else if (typeof value === 'object') {
            extract(value)
          }
        }
      }

      extract(node)
      return vars
    }

    function reportSequence(awaitStatements: any[]): void {
      if (!checkIfIndependent(awaitStatements)) return

      const first = awaitStatements[0].stmt
      const line = first.loc?.start.line || 0
      const lines = code.split('\n')
      const codeSnippet = lines.slice(line - 1, line + awaitStatements.length).join('\n')

      issues.push({
        id: `sequential-requests-${line}`,
        rule: 'sequential-requests',
        severity: 'warning',
        category: 'io',
        location: {
          file: filePath,
          line,
          column: 0,
        },
        message: `${awaitStatements.length} sequential await calls create waterfall`,
        description: `These ${awaitStatements.length} await statements run sequentially, but appear to be independent. Running them in parallel with Promise.all() would be faster.`,
        impact: {
          type: 'io',
          level: 'medium',
          estimate: `${awaitStatements.length}x slower than necessary`,
        },
        suggestion: {
          fix: 'Use Promise.all() to run these operations in parallel',
          example: `// Instead of:\nconst data1 = await fetch('/api/1')\nconst data2 = await fetch('/api/2')\nconst data3 = await fetch('/api/3')\n\n// Use:\nconst [data1, data2, data3] = await Promise.all([\n  fetch('/api/1'),\n  fetch('/api/2'),\n  fetch('/api/3')\n])`,
          docs: 'https://vitals.dev/rules/sequential-requests',
        },
        autoFixable: false,
        codeSnippet: {
          before: codeSnippet.trim(),
          context: [],
        },
      })
    }

    checkNode(ast)
    return issues
  },
}
