# Ceviz Plugin API

Ceviz supports a powerful plugin system that allows you to:
- Create custom performance rules
- Add custom reporters
- Hook into the analysis lifecycle
- Extend functionality for specific frameworks

## Quick Start

### 1. Create a Plugin

```typescript
// ceviz-plugins/my-plugin.ts
import type { CevizPlugin, Rule, RuleContext, Issue } from 'ceviz'

const myCustomRule: Rule = {
  id: 'my-custom-rule',
  name: 'My Custom Rule',
  category: 'cpu',
  severity: 'warning',
  description: 'Detects something important',
  enabled: true,
  check: (context: RuleContext): Issue[] => {
    const issues: Issue[] = []
    // Your analysis logic here
    return issues
  },
}

const myPlugin: CevizPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  rules: [myCustomRule],
}

export default myPlugin
```

### 2. Use the Plugin

Create `ceviz.config.ts`:

```typescript
// ceviz.config.ts
import { defineConfig } from 'ceviz'
import myPlugin from './ceviz-plugins/my-plugin.js'

export default defineConfig({
  plugins: [
    myPlugin,
    // Or load from npm:
    'ceviz-plugin-vue',
    'ceviz-plugin-react',
  ],

  // Configure rules
  rules: {
    'my-custom-rule': 'error',
    'nested-loops': 'warn',
  },

  // Output options
  reporters: ['console', 'html'],
})
```

TypeScript will provide full autocomplete and type checking!

### 3. Run Analysis

```bash
pnpm exec ceviz analyze --config ceviz.config.ts
```

## Plugin Interface

```typescript
interface CevizPlugin {
  name: string
  version?: string
  rules?: Rule[]
  reporters?: Reporter[]
  setup?: (context: PluginContext) => void | Promise<void>
}
```

### Plugin Context

The `setup` function receives a `PluginContext` with useful APIs:

```typescript
interface PluginContext {
  addRule: (rule: Rule) => void
  addReporter: (reporter: Reporter) => void
  hooks: Hookable // See Hooks section
  config: CevizConfig
  projectContext: ProjectContext
}
```

## Creating Custom Rules

A rule analyzes code and returns issues:

```typescript
interface Rule {
  id: string // Unique identifier
  name: string // Display name
  category: 'cpu' | 'memory' | 'io' | 'bundle' | 'framework'
  severity: 'critical' | 'warning' | 'info'
  description: string
  enabled: boolean
  check: (context: RuleContext) => Issue[]
}
```

### Rule Context

Your `check` function receives:

```typescript
interface RuleContext {
  ast: any // OXC AST (parsed JavaScript/TypeScript)
  code: string // Raw source code
  filePath: string // Absolute file path
  fileContent: string // Same as code
  projectRoot: string // Project root directory
  isNuxt: boolean // Is Nuxt project?
  isVue: boolean // Is Vue project?
  isTS: boolean // Is TypeScript file?
}
```

### Example: Detect Expensive Operations

```typescript
const expensiveRegexRule: Rule = {
  id: 'expensive-regex',
  name: 'Expensive Regular Expression',
  category: 'cpu',
  severity: 'warning',
  description: 'Detects regex that may cause catastrophic backtracking',
  enabled: true,
  check: (context: RuleContext): Issue[] => {
    const issues: Issue[] = []
    const { ast, filePath, code } = context

    const checkNode = (node: any): void => {
      if (!node || typeof node !== 'object') return

      // Check for RegExp literals
      if (node.type === 'RegExpLiteral') {
        const pattern = node.pattern

        // Detect nested quantifiers (e.g., (a+)+)
        if (/\([^)]*\+[^)]*\)\+/.test(pattern)) {
          const line = node.loc?.start.line || 0
          const column = node.loc?.start.column || 0

          issues.push({
            id: `expensive-regex-${line}`,
            rule: 'expensive-regex',
            severity: 'warning',
            category: 'cpu',
            location: { file: filePath, line, column },
            message: 'Regex with nested quantifiers may cause catastrophic backtracking',
            description: 'This regex pattern contains nested quantifiers that can cause exponential time complexity on certain inputs.',
            impact: {
              type: 'cpu',
              level: 'high',
              complexity: 'O(2^n)',
              estimate: 'Can hang the application on malicious input',
            },
            suggestion: {
              fix: 'Rewrite the regex to avoid nested quantifiers',
              example: `// Bad:\n/(a+)+/\n\n// Good:\n/a+/`,
              docs: 'https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS',
            },
            autoFixable: false,
            codeSnippet: {
              before: code.split('\n')[line - 1]?.trim() || '',
              context: [],
            },
          })
        }
      }

      // Recurse through AST
      for (const key in node) {
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
```

## Hooks System

Ceviz uses [unjs/hookable](https://github.com/unjs/hookable) for lifecycle hooks.

### Available Hooks

```typescript
interface CevizHooks {
  'plugin:loading': (pluginName: string) => void
  'plugin:loaded': (plugin: CevizPlugin) => void
  'rule:added': (rule: Rule) => void
  'reporter:added': (reporter: Reporter) => void
  'analysis:start': (context: ProjectContext) => void
  'analysis:file': (filePath: string) => void
  'analysis:complete': (issuesCount: number) => void
  'config:resolved': (config: CevizConfig) => void
}
```

### Using Hooks

```typescript
const myPlugin: CevizPlugin = {
  name: 'my-plugin',
  setup: async (context) => {
    // Listen to hooks
    context.hooks.hook('analysis:start', (projectContext) => {
      console.log(`Starting analysis for ${projectContext.framework}`)
    })

    context.hooks.hook('analysis:file', (filePath) => {
      console.log(`Analyzing: ${filePath}`)
    })

    context.hooks.hook('analysis:complete', (issuesCount) => {
      console.log(`Found ${issuesCount} issues`)
    })
  },
}
```

## Creating Custom Reporters

```typescript
import type { Reporter, AnalysisResult } from 'ceviz'

const markdownReporter: Reporter = {
  name: 'markdown',
  report: async (result: AnalysisResult, outputPath?: string) => {
    const markdown = `# Ceviz Report

## Summary
- Files analyzed: ${result.summary.analyzedFiles}
- Total issues: ${result.summary.totalIssues}
- Performance score: ${result.summary.score}/100

## Issues

${result.issues.map(issue => `
### ${issue.severity.toUpperCase()}: ${issue.message}
- File: ${issue.location.file}:${issue.location.line}
- Category: ${issue.category}
- Fix: ${issue.suggestion?.fix || 'N/A'}
`).join('\n')}
`

    if (outputPath) {
      await writeFile(outputPath, markdown)
      console.log(`Markdown report saved to: ${outputPath}`)
    } else {
      console.log(markdown)
    }
  },
}

const myPlugin: CevizPlugin = {
  name: 'my-plugin',
  reporters: [markdownReporter],
}
```

## VSCode Integration

Issues in HTML reports include deep links to VSCode:

```html
<a href="vscode://file/path/to/file.ts:42:15">
  Open in VSCode
</a>
```

When clicked, VSCode will open the file at the exact line and column.

## Example Plugins

See [examples/custom-rule-plugin.ts](packages/vitals/examples/custom-rule-plugin.ts) for a complete example.

## Publishing Plugins

To publish a plugin to npm:

1. Name it with `ceviz-plugin-` prefix: `ceviz-plugin-vue`
2. Export a default CevizPlugin object
3. Publish to npm

```json
{
  "name": "ceviz-plugin-vue",
  "version": "1.0.0",
  "main": "dist/index.js",
  "type": "module"
}
```

Users can then install and use it:

```bash
pnpm add -D ceviz-plugin-vue
```

```typescript
// ceviz.config.ts
export default defineConfig({
  plugins: ['ceviz-plugin-vue']
})
```

## Community Plugins

- `ceviz-plugin-vue` - Vue 3 specific rules
- `ceviz-plugin-react` - React specific rules
- `ceviz-plugin-nuxt` - Nuxt 3 specific rules
- `ceviz-plugin-nextjs` - Next.js specific rules

_(Coming soon - contribute yours!)_

## Best Practices

1. **Keep rules focused**: Each rule should detect one specific issue
2. **Provide actionable suggestions**: Always include fix examples
3. **Use meaningful severity levels**:
   - `critical`: Performance regression > 100ms
   - `warning`: Potential issues, code smells
   - `info`: Suggestions, best practices
4. **Test your rules**: Write tests for edge cases
5. **Document your rules**: Clear descriptions and examples

## Contributing

Want to contribute a plugin? See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

Built with ❤️ using [unjs/hookable](https://github.com/unjs/hookable)
