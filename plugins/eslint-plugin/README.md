# eslint-plugin-ceviz

ESLint plugin for Ceviz performance analysis - catch performance issues in real-time while coding.

## Installation

```bash
pnpm add -D eslint-plugin-ceviz
```

## Usage

### Flat Config (ESLint 9+)

```javascript
import ceviz from 'eslint-plugin-ceviz'

export default [
  ceviz.configs.recommended,
  // Your other configs
]
```

### Custom Configuration

```javascript
import ceviz from 'eslint-plugin-ceviz'

export default [
  {
    plugins: { ceviz },
    rules: {
      'ceviz/nested-loops': 'error',
      'ceviz/array-find-in-loop': 'warn',
      'ceviz/memory-leak-interval': 'error',
      'ceviz/sync-file-operations': 'error',
      'ceviz/sequential-requests': 'off',
    },
  },
]
```

## Rules

| Rule | Description | Severity |
|------|-------------|----------|
| `nested-loops` | Detects O(n²) or worse nested loops | error |
| `array-find-in-loop` | Detects array operations in loops (O(n*m)) | error |
| `memory-leak-interval` | Detects unclosed intervals/timeouts | error |
| `sync-file-operations` | Detects blocking file operations | error |
| `sequential-requests` | Detects parallelizable async operations | warn |

## Preset Configs

- **recommended** - All rules with sensible defaults
- **strict** - All rules as errors
- **all** - All available rules

## Disable Comments

Use standard ESLint disable comments:

```javascript
// eslint-disable-next-line ceviz/nested-loops
for (const user of users) {
  for (const post of posts) { ... }
}
```

## License

MIT
