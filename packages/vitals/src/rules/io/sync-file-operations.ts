import type { Rule, Issue, RuleContext } from '../../types.js'
import { getNodeLocation } from '../../utils/ast-helpers.js'

/**
 * Detect synchronous file operations that block the event loop
 * This is CRITICAL in Node.js - blocks entire server!
 */
export const syncFileOperationsRule: Rule = {
  id: 'sync-file-operations',
  name: 'Synchronous File Operations',
  category: 'io',
  severity: 'critical',
  description: 'Detects synchronous file operations that block the event loop',
  enabled: true,
  check: (context: RuleContext): Issue[] => {
    const issues: Issue[] = []
    const { ast, filePath, code } = context

    const syncMethods = [
      // File system
      'readFileSync',
      'writeFileSync',
      'appendFileSync',
      'readdirSync',
      'statSync',
      'lstatSync',
      'accessSync',
      'existsSync',
      'mkdirSync',
      'rmdirSync',
      'unlinkSync',
      'copyFileSync',
      'renameSync',
      // Crypto
      'pbkdf2Sync',
      'scryptSync',
      'randomFillSync',
      'generateKeyPairSync',
      // Child process
      'execSync',
      'execFileSync',
      'spawnSync',
    ]

    const checkNode = (node: any): void => {
      if (!node || typeof node !== 'object') return

      if (node.type === 'CallExpression') {
        const callee = node.callee
        const calleeName = callee?.name || callee?.property?.name

        if (syncMethods.includes(calleeName)) {
          const { line, column } = getNodeLocation(node, code)
          const lines = code.split('\n')
          const codeSnippet = lines[line - 1] || ''

          let category: 'io' | 'cpu' = 'io'
          let estimate = '50-200ms block'
          let asyncAlternative = calleeName.replace('Sync', '')

          // Crypto operations are more CPU-intensive
          if (calleeName.includes('pbkdf2') || calleeName.includes('scrypt')) {
            category = 'io'
            estimate = '100-500ms block per call'
          }

          issues.push({
            id: `sync-file-op-${line}`,
            rule: 'sync-file-operations',
            severity: 'critical',
            category,
            location: {
              file: filePath,
              line,
              column,
            },
            message: `${calleeName}() blocks the event loop`,
            description: `Synchronous operations like ${calleeName}() block the entire Node.js event loop. During this time, the server cannot handle ANY other requests. This is especially critical in API routes and middleware.`,
            impact: {
              type: 'io',
              level: 'extreme',
              blocking: true,
              estimate,
            },
            suggestion: {
              fix: `Use async version: ${asyncAlternative}()`,
              example: `// Instead of:\nconst data = fs.${calleeName}('file.txt')\n\n// Use:\nconst data = await fs.promises.${asyncAlternative}('file.txt')\n// or\nfs.${asyncAlternative}('file.txt', (err, data) => {...})`,
              docs: 'https://github.com/productdevbook/ceviz#sync-file-operations',
            },
            autoFixable: false,
            codeSnippet: {
              before: codeSnippet.trim(),
              context: lines.slice(Math.max(0, line - 3), line + 2),
            },
          })
        }
      }

      // Check all children
      for (const key in node) {
        if (key === 'type' || key === 'loc' || key === 'range') continue
        const value = node[key]
        if (Array.isArray(value)) {
          value.forEach(checkNode)
        } else if (typeof value === 'object') {
          checkNode(value)
        }
      }
    }

    checkNode(ast)
    return issues
  },
}
