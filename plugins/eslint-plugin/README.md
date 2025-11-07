# eslint-plugin-ceviz

ESLint plugin for performance analysis powered by Ceviz.

## Installation

```bash
pnpm add -D eslint-plugin-ceviz
```

## Usage

### Recommended (Flat Config)

```js
import ceviz from 'eslint-plugin-ceviz'

export default [
  {
    plugins: { ceviz },
    ...ceviz.configs.recommended,
  },
]
```

### Manual Configuration

```js
import ceviz from 'eslint-plugin-ceviz'

export default [
  {
    plugins: { ceviz },
    rules: {
      'ceviz/array-find-in-loop': 'warn',
      'ceviz/nested-loops': 'warn',
      'ceviz/memory-leak-interval': 'error',
      'ceviz/sequential-requests': 'warn',
      'ceviz/sync-file-operations': 'warn',
    },
  },
]
```

## Configs

- `recommended` - Critical performance rules (memory-leak as error)
- `strict` - All rules as errors
- `all` - All rules as warnings

## Rules

- `array-find-in-loop` - Detect O(n²) array operations inside loops
- `nested-loops` - Detect nested loops with high complexity
- `memory-leak-interval` - Detect setInterval/setTimeout without cleanup
- `sequential-requests` - Detect sequential awaits that could be parallelized
- `sync-file-operations` - Detect blocking synchronous file operations

## License

MIT
