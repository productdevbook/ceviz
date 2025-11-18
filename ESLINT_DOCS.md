# ESLint Plugin Ceviz

Performance-focused ESLint rules that catch runtime issues at lint time.

## Quick Start

```bash
pnpm add -D eslint-plugin-ceviz
```

```javascript
// eslint.config.js
import ceviz from 'eslint-plugin-ceviz'

export default [ceviz.configs.recommended]
```

## Installation

```bash
# pnpm
pnpm add -D eslint-plugin-ceviz

# npm
npm install -D eslint-plugin-ceviz

# yarn
yarn add -D eslint-plugin-ceviz
```

## Usage

### ESLint Flat Config (Recommended)

```javascript
// eslint.config.js
import ceviz from 'eslint-plugin-ceviz'

export default [
  ceviz.configs.recommended,
  // Your other configs...
]
```

### Using Specific Configs

```javascript
// eslint.config.js
import ceviz from 'eslint-plugin-ceviz'

export default [
  // Recommended: all critical rules as errors, sequential-requests as warning
  ceviz.configs.recommended,

  // Strict: all rules as errors
  ceviz.configs.strict,

  // All: same as recommended
  ceviz.configs.all,
]
```

## Rules

All rules focus on catching performance issues that would otherwise only appear at runtime.

| Rule | Type | Severity | Description |
|------|------|----------|-------------|
| [nested-loops](#nested-loops) | CPU | error | Detects O(n²) or worse nested loops |
| [array-find-in-loop](#array-find-in-loop) | CPU | error | Detects O(n*m) array operations in loops |
| [memory-leak-interval](#memory-leak-interval) | Memory | error | Detects unclosed intervals/timeouts |
| [sync-file-operations](#sync-file-operations) | I/O | error | Detects blocking file operations |
| [sequential-requests](#sequential-requests) | I/O | warn | Detects parallelizable async operations |

### nested-loops

**Why it matters:** Nested loops create O(n²) or worse complexity. For 1000 items, execution time grows from ~100ms to ~10s.

**What it detects:**
- Nested forEach/for/while loops
- Triple nested loops (O(n³))
- Any loop nesting that creates quadratic or worse complexity

```typescript
// ❌ BAD - O(n²) complexity
users.forEach((user) => {
  posts.forEach((post) => {
    if (post.userId === user.id) {
      user.posts.push(post)
    }
  })
})

// ✅ GOOD - O(n) with Map
const postsByUser = new Map()
posts.forEach((post) => {
  if (!postsByUser.has(post.userId)) {
    postsByUser.set(post.userId, [])
  }
  postsByUser.get(post.userId).push(post)
})

users.forEach((user) => {
  user.posts = postsByUser.get(user.id) || []
})
```

**Impact:** 1000 items: 100ms → 10s | 10,000 items: 1s → 100s

### array-find-in-loop

**Why it matters:** Using array.find() inside loops creates O(n*m) complexity. For 1000x1000 items, execution time can reach 5+ seconds.

**What it detects:**
- `array.find()` inside forEach/map/filter
- `array.findIndex()` inside loops
- Any array search method inside iteration

```typescript
// ❌ BAD - O(n*m) complexity
items.filter((item) => {
  const category = categories.find(cat => cat.id === item.categoryId)
  return category?.active
})

// ✅ GOOD - O(n) with Map
const categoryMap = new Map(categories.map(c => [c.id, c]))
items.filter(item => categoryMap.get(item.categoryId)?.active)
```

**Impact:** 1000x1000 items: 10ms → 5s | Grows exponentially

### memory-leak-interval

**Why it matters:** Unclosed intervals/timeouts cause memory leaks. Memory grows indefinitely until app crashes.

**What it detects:**
- `setInterval()` without corresponding `clearInterval()`
- `setTimeout()` without cleanup in components
- Event listeners without removal

```typescript
// ❌ BAD - Memory leak
// ✅ GOOD - Vue Composition API
import { onUnmounted } from 'vue'

export default {
  mounted() {
    setInterval(() => {
      this.fetchData()
    }, 1000)
  }
}

// ✅ GOOD - Proper cleanup
export default {
  mounted() {
    this.interval = setInterval(() => {
      this.fetchData()
    }, 1000)
  },
  unmounted() {
    clearInterval(this.interval)
  }
}

const interval = setInterval(() => {
  fetchData()
}, 1000)

onUnmounted(() => {
  clearInterval(interval)
})
```

**Impact:** Memory grows indefinitely | App crashes after prolonged use

### sync-file-operations

**Why it matters:** Synchronous file operations block the event loop. Each call blocks for 50-200ms, freezing your entire app.

**What it detects:**
- `fs.readFileSync()`
- `fs.writeFileSync()`
- `fs.existsSync()` in hot paths
- Any blocking fs operation

```typescript
// ❌ BAD - Blocks event loop
import fs from 'node:fs'

// ✅ GOOD - Non-blocking
import fs from 'node:fs/promises'

export default defineEventHandler(() => {
  const data = fs.readFileSync('config.json', 'utf-8')
  return JSON.parse(data)
})

export default defineEventHandler(async () => {
  const data = await fs.readFile('config.json', 'utf-8')
  return JSON.parse(data)
})
```

**Impact:** 50-200ms block per call | Freezes entire app

### sequential-requests

**Why it matters:** Sequential async operations create waterfalls. 3 independent 100ms requests take 300ms instead of 100ms.

**What it detects:**
- Sequential await calls that could be parallel
- Multiple independent async operations in sequence
- API calls that don't depend on each other

```typescript
// ❌ BAD - Sequential (300ms total)
async function loadData() {
  const user = await fetchUser()
  const posts = await fetchPosts()
  const comments = await fetchComments()
  return { user, posts, comments }
}

// ✅ GOOD - Parallel (100ms total)
async function loadData() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ])
  return { user, posts, comments }
}

// ⚠️ EXCEPTION - Dependent operations
async function loadUserData(userId: string) {
  const user = await fetchUser(userId)
  // posts depends on user.id, so must be sequential
  const posts = await fetchPosts(user.id)
  return { user, posts }
}
```

**Impact:** 3x slower for 3 operations | Multiplies by operation count

## Preset Configs

### recommended

All critical rules as errors, sequential-requests as warning. Best for most projects.

```javascript
{
  'ceviz/nested-loops': 'error',
  'ceviz/array-find-in-loop': 'error',
  'ceviz/memory-leak-interval': 'error',
  'ceviz/sync-file-operations': 'error',
  'ceviz/sequential-requests': 'warn',
}
```

### strict

All rules as errors. Use for performance-critical apps.

```javascript
{
  'ceviz/nested-loops': 'error',
  'ceviz/array-find-in-loop': 'error',
  'ceviz/memory-leak-interval': 'error',
  'ceviz/sync-file-operations': 'error',
  'ceviz/sequential-requests': 'error',
}
```

### all

Same as recommended. Alias for consistency.

## Configuration

### Customize Rule Severity

```javascript
// eslint.config.js
import ceviz from 'eslint-plugin-ceviz'

export default [
  ceviz.configs.recommended,
  {
    rules: {
      // Turn off specific rule
      'ceviz/sequential-requests': 'off',

      // Change severity
      'ceviz/nested-loops': 'warn',

      // Keep as error
      'ceviz/memory-leak-interval': 'error',
    }
  }
]
```

### Use Specific Rules Only

```javascript
// eslint.config.js
import ceviz from 'eslint-plugin-ceviz'

export default [
  {
    plugins: {
      ceviz
    },
    rules: {
      'ceviz/nested-loops': 'error',
      'ceviz/memory-leak-interval': 'error',
    }
  }
]
```

## Disable Comments

Disable rules for specific code when needed:

```typescript
// Disable single rule for next line
// eslint-disable-next-line ceviz/nested-loops
users.forEach((user) => {
  posts.forEach((post) => {
    // Known small datasets
  })
})

// Disable multiple rules
// eslint-disable-next-line ceviz/nested-loops, ceviz/array-find-in-loop
function smallDatasetOperation() {
  // ...
}

// Disable for entire file
/* eslint-disable ceviz/nested-loops */

// Disable all ceviz rules for block
/* eslint-disable ceviz */
const config = fs.readFileSync('config.json', 'utf-8')
/* eslint-enable ceviz */
```

## Examples

### Full Setup with Custom Config

```javascript
import antfu from '@antfu/eslint-config'
// eslint.config.js
import ceviz from 'eslint-plugin-ceviz'

export default antfu(
  {
    // Your antfu config
  },
  ceviz.configs.recommended,
  {
    // Custom overrides
    rules: {
      'ceviz/sequential-requests': 'error',
    }
  }
)
```

### Framework-Specific Setup

**Nuxt/Vue:**
```javascript
import ceviz from 'eslint-plugin-ceviz'
// eslint.config.js
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  ceviz.configs.recommended
)
```

**Next.js:**
```javascript
// eslint.config.js
import ceviz from 'eslint-plugin-ceviz'

export default [
  ceviz.configs.recommended,
  // Your Next.js config
]
```

### Real-World Example

```typescript
// Before (with performance issues)
async function loadDashboard() {
  const user = await fetchUser()
  const posts = await fetchPosts()
  const stats = await fetchStats()

  const enriched = posts.map((post) => {
    const author = users.find(u => u.id === post.authorId) // ⚠️ O(n*m)
    return { ...post, author }
  })

  users.forEach((user) => {
    posts.forEach((post) => { // ⚠️ O(n²)
      if (post.userId === user.id) {
        user.posts.push(post)
      }
    })
  })

  return { user, posts, stats, enriched }
}

// After (optimized)
async function loadDashboard() {
  // Parallel requests ✅
  const [user, posts, stats] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchStats()
  ])

  // O(n) with Map ✅
  const authorMap = new Map(users.map(u => [u.id, u]))
  const enriched = posts.map(post => ({
    ...post,
    author: authorMap.get(post.authorId)
  }))

  // O(n) grouping ✅
  const postsByUser = new Map()
  posts.forEach((post) => {
    if (!postsByUser.has(post.userId)) {
      postsByUser.set(post.userId, [])
    }
    postsByUser.get(post.userId).push(post)
  })

  users.forEach((user) => {
    user.posts = postsByUser.get(user.id) || []
  })

  return { user, posts, stats, enriched }
}
```

## Example Project

Test the plugin locally:

```bash
cd examples/eslint
pnpm install
pnpm run lint
```

The example includes `rules-demo.js` with all rule violations covered by the plugin rules.

## CI/CD Integration

```yaml
# .github/workflows/lint.yml
name: Lint
on: [pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run lint
```

## Related Tools

- **[ceviz](https://github.com/productdevbook/ceviz)** - Full codebase performance analyzer
- **[ceviz-core](../ceviz-core)** - Shared analysis rules

## License

MIT
