/**
 * Example Ceviz Plugin
 *
 * This shows how to create custom rules for Ceviz analyzer.
 *
 * Usage:
 * 1. Create ceviz.config.ts in your project root:
 *
 * import { defineConfig } from 'ceviz'
 * import customPlugin from './ceviz-plugins/my-plugin.js'
 *
 * export default defineConfig({
 *   plugins: [customPlugin]
 * })
 *
 * 2. Or load from npm package:
 *
 * export default defineConfig({
 *   plugins: ['ceviz-plugin-vue', 'ceviz-plugin-react']
 * })
 */

import type { CevizPlugin, Rule, RuleContext, Issue } from '../src/types.js'

// Example: Detect console.log() in production code
const noConsoleLogRule: Rule = {
  id: 'no-console-log',
  name: 'No Console.log',
  category: 'framework',
  severity: 'warning',
  description: 'Detects console.log() calls that should be removed in production',
  enabled: true,
  check: (context: RuleContext): Issue[] => {
    const issues: Issue[] = []
    const { ast, filePath, code } = context

    const checkNode = (node: any): void => {
      if (!node || typeof node !== 'object') return

      // Check if this is console.log()
      if (
        node.type === 'CallExpression' &&
        node.callee?.type === 'MemberExpression' &&
        node.callee?.object?.name === 'console' &&
        (node.callee?.property?.name === 'log' ||
         node.callee?.property?.name === 'debug' ||
         node.callee?.property?.name === 'info')
      ) {
        const line = node.loc?.start.line || 0
        const column = node.loc?.start.column || 0

        const lines = code.split('\n')
        const codeSnippet = lines[line - 1] || ''

        issues.push({
          id: `no-console-log-${line}`,
          rule: 'no-console-log',
          severity: 'warning',
          category: 'framework',
          location: {
            file: filePath,
            line,
            column,
          },
          message: `console.${node.callee.property.name}() found in production code`,
          description: 'Console statements should be removed before deploying to production as they can impact performance and leak sensitive information.',
          impact: {
            type: 'io',
            level: 'low',
            estimate: '~1-5ms per call',
          },
          suggestion: {
            fix: 'Remove console statements or use a proper logger',
            example: `// Instead of:\nconsole.log('data:', data)\n\n// Use:\nimport { logger } from './logger'\nlogger.debug('data:', data) // Only logs in dev`,
            alternatives: {
              'use-logger': 'Use a structured logger like pino or winston',
              'use-debug': 'Use the debug package for conditional logging',
            },
          },
          autoFixable: true,
          codeSnippet: {
            before: codeSnippet.trim(),
            context: lines.slice(Math.max(0, line - 2), line + 1),
          },
        })
      }

      // Recursively check all child nodes
      for (const key in node) {
        if (key === 'type' || key === 'loc' || key === 'range') continue
        const value = node[key]
        if (Array.isArray(value)) {
          value.forEach(child => checkNode(child))
        } else if (typeof value === 'object') {
          checkNode(value)
        }
      }
    }

    checkNode(ast)
    return issues
  },
}

// Example: Detect TODO comments
const noTodoCommentsRule: Rule = {
  id: 'no-todo-comments',
  name: 'No TODO Comments',
  category: 'framework',
  severity: 'info',
  description: 'Detects TODO comments that should be tracked as issues',
  enabled: true,
  check: (context: RuleContext): Issue[] => {
    const issues: Issue[] = []
    const { filePath, code } = context

    const lines = code.split('\n')
    lines.forEach((line, index) => {
      const match = line.match(/\/\/\s*(TODO|FIXME|XXX|HACK):?\s*(.+)/)
      if (match) {
        const [, tag, message] = match
        const column = line.indexOf(tag)

        issues.push({
          id: `no-todo-${index + 1}`,
          rule: 'no-todo-comments',
          severity: 'info',
          category: 'framework',
          location: {
            file: filePath,
            line: index + 1,
            column,
          },
          message: `${tag} comment found: ${message.trim()}`,
          description: 'TODO comments should be tracked as GitHub issues instead of left in code.',
          impact: {
            type: 'framework',
            level: 'low' as const,
          },
          suggestion: {
            fix: 'Create a GitHub issue and remove the comment',
            example: 'Use GitHub issues or project management tools to track work items',
          },
          autoFixable: false,
          codeSnippet: {
            before: line.trim(),
            context: [line],
          },
        })
      }
    })

    return issues
  },
}

// Export the plugin
const customRulePlugin: CevizPlugin = {
  name: 'ceviz-custom-rules',
  version: '1.0.0',

  // Provide custom rules
  rules: [
    noConsoleLogRule,
    noTodoCommentsRule,
  ],

  // Optional: setup hook
  setup: async (context) => {
    console.log('🔌 Custom rules plugin initialized')

    // You can add more rules dynamically
    context.addRule({
      id: 'dynamic-rule-example',
      name: 'Dynamic Rule',
      category: 'cpu',
      severity: 'info',
      description: 'A rule added dynamically in setup',
      enabled: false, // Disabled by default
      check: () => [],
    })

    // Listen to hooks
    context.hooks.hook('analysis:start', (projectContext: any) => {
      console.log(`📊 Starting analysis for: ${projectContext.framework || 'unknown framework'}`)
    })

    context.hooks.hook('analysis:complete', (issuesCount: number) => {
      console.log(`✅ Analysis complete! Found ${issuesCount} issues`)
    })
  },
}

export default customRulePlugin
