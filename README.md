# 🩺 Vitals

**Automatic performance analyzer for Node.js, Nuxt, and Vite projects**

Vitals automatically scans your codebase and detects performance issues that slow down your application:

- 🔍 **O(n²) and O(n³) complexity** - Nested loops and inefficient algorithms
- 💾 **Memory leaks** - Unclosed intervals, event listeners, and memory bloat
- 📡 **Blocking operations** - Synchronous file I/O and CPU-heavy operations
- ⚡ **Waterfall requests** - Sequential async operations that could be parallel
- 📦 **Bundle bloat** - Heavy dependencies and unnecessary imports

## Features

- ✅ **Zero configuration** - Works out of the box
- ⚡ **Blazing fast** - Powered by OXC (Rust-based parser)
- 🎯 **Accurate detection** - AST-based analysis finds real issues
- 📊 **Beautiful reports** - Console and JSON output
- 🔧 **Actionable suggestions** - Get specific fixes for each issue
- 🚀 **CI/CD ready** - Exit codes for automated checks

## Installation

```bash
# Run without installing
npx @vitals/analyzer analyze

# Or install globally
pnpm add -g @vitals/analyzer

# Or add to your project
pnpm add -D @vitals/analyzer
```

## Usage

### Analyze your project

```bash
# Analyze current directory
vitals analyze

# Analyze specific path
vitals analyze ./my-project

# Output as JSON
vitals analyze --json

# Save JSON to file
vitals analyze --json report.json
```

### Example Output

```
🩺 Vitals Performance Analysis
────────────────────────────────────────────────────────────

📊 Summary
────────────────────────────────────────────────────────────
  Files analyzed:     147
  Total issues:       12
    ● Critical:      5
    ● Warnings:      7
    ● Info:          0
  Performance score:  72/100 👍
  Analysis time:      1234ms

🔴 Critical Issues
────────────────────────────────────────────────────────────

  ⚡ CRITICAL: Nested loop detected (O(n²) complexity)
     server/api/users.ts:42
     Impact: 100ms → 10s for 1000 items
     Complexity: O(n²)
     → Use Map/Set for O(1) lookups instead of nested loops

  ⚡ CRITICAL: Array.find() inside loop creates O(n*m) complexity
     composables/useData.ts:78
     Impact: 10ms → 5s for 1000x1000 items
     → Convert array to Map/Set before the loop for O(1) lookups

  💾 CRITICAL: setInterval without cleanup causes memory leak
     components/LiveData.vue:156
     Impact: Memory grows indefinitely
     → Clear interval in onUnmounted lifecycle

  📡 CRITICAL: readFileSync() blocks the event loop
     server/api/config.ts:12
     Impact: 50-200ms block per call
     → Use async version: readFile()

📈 Performance Metrics
────────────────────────────────────────────────────────────
  CPU
    Worst complexity:  O(n²)
    Hotspots:          5 locations

  Memory
    Est. baseline:     450MB
    Memory leaks:      2
    Bloat level:       medium

  Bundle
    Current size:      1.2MB
    Potential savings: 458KB
    Heavy deps:        moment, lodash

  I/O
    Blocking ops:      1
    Waterfalls:        3

💡 Quick wins:
  1. Fix critical O(n²) loops → use Map/Set for lookups
  2. Replace sync file operations → use async versions
  3. Clean up memory leaks → add proper cleanup
```

## What Vitals Detects

### CPU Issues

#### Nested Loops (O(n²))
```typescript
// ❌ BAD - O(n²)
users.forEach(user => {
  posts.forEach(post => {
    if (post.userId === user.id) {
      // ...
    }
  })
})

// ✅ GOOD - O(n)
const postsByUser = new Map()
for (const post of posts) {
  if (!postsByUser.has(post.userId)) {
    postsByUser.set(post.userId, [])
  }
  postsByUser.get(post.userId).push(post)
}
```

#### Array.find() in Loop
```typescript
// ❌ BAD - O(n*m)
items.filter(item => {
  const category = categories.find(cat => cat.id === item.categoryId)
  return category?.active
})

// ✅ GOOD - O(n)
const categoryMap = new Map(categories.map(c => [c.id, c]))
items.filter(item => categoryMap.get(item.categoryId)?.active)
```

### Memory Issues

#### Unclosed Intervals
```typescript
// ❌ BAD - Memory leak
const interval = setInterval(() => {
  fetchData()
}, 1000)

// ✅ GOOD - Cleaned up
const interval = setInterval(() => {
  fetchData()
}, 1000)

onUnmounted(() => {
  clearInterval(interval)
})
```

### I/O Issues

#### Synchronous File Operations
```typescript
// ❌ BAD - Blocks event loop
const data = fs.readFileSync('file.txt', 'utf-8')

// ✅ GOOD - Non-blocking
const data = await fs.promises.readFile('file.txt', 'utf-8')
```

#### Sequential Async Operations
```typescript
// ❌ BAD - Waterfall (3x slower)
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()

// ✅ GOOD - Parallel
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

## Rules

Vitals currently has **5 core rules**:

| Rule | Category | Severity | Description |
|------|----------|----------|-------------|
| `nested-loops` | CPU | Critical | Detects O(n²) or worse nested loops |
| `array-find-in-loop` | CPU | Critical | Detects O(n*m) array operations in loops |
| `memory-leak-interval` | Memory | Critical | Detects unclosed intervals/timeouts |
| `sync-file-operations` | I/O | Critical | Detects blocking file operations |
| `sequential-requests` | I/O | Warning | Detects parallelizable async operations |

More rules coming soon!

## CI/CD Integration

Vitals exits with code 1 if critical issues are found, making it perfect for CI/CD:

```yaml
# GitHub Actions
name: Performance Check
on: [pull_request]

jobs:
  vitals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm dlx @vitals/analyzer analyze
```

## Roadmap

- [ ] HTML report with interactive visualization
- [ ] More rules (regex catastrophic backtracking, excessive re-renders, etc.)
- [ ] Auto-fix capabilities
- [ ] Framework-specific rules (Nuxt, Next.js, Vue, React)
- [ ] VS Code extension
- [ ] Configuration file support
- [ ] Custom rules API

## Tech Stack

- **OXC** - Lightning-fast Rust-based parser (50-100x faster than Babel)
- **Rolldown** - Next-gen bundler for bundle analysis
- **TypeScript** - Type-safe codebase
- **Commander** - CLI interface
- **Chalk** - Beautiful console output

## Contributing

Contributions welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

## License

MIT © Vitals Team

---

**Built with ❤️ for the Node.js/Nuxt community**
