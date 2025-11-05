# Framework Analysis Mode

## Overview

Ceviz now supports **two modes**:

### Mode 1: User Code Analysis (Default)
```bash
ceviz analyze ./my-project
```
- ✅ Analyzes **user's code** only
- ❌ **Excludes** node_modules, dist, .nuxt, etc.
- 🎯 **Purpose**: Help developers fix their own performance issues

### Mode 2: Framework Analysis (New!)
```bash
ceviz analyze ./my-project --scan-deps --target-deps nuxt,vite
```
- ✅ Analyzes **framework code** in node_modules
- ✅ **Includes** specific packages (nuxt, vite, etc.)
- 🎯 **Purpose**: Find performance issues in frameworks to report via GitHub issues

## Usage

### Analyze Nuxt Core
```bash
# Using pnpm exec (recommended in monorepo)
pnpm exec ceviz analyze . --scan-deps --target-deps nuxt

# Or using node directly
node packages/vitals/dist/cli.mjs analyze . --scan-deps --target-deps nuxt

# Or if globally installed
ceviz analyze . --scan-deps --target-deps nuxt
```

### Analyze Multiple Frameworks
```bash
pnpm exec ceviz analyze . --scan-deps --target-deps nuxt,vite,vue
```

### Analyze Scoped Packages
```bash
pnpm exec ceviz analyze . --scan-deps --target-deps '@nuxt/*'
```

## Example: Finding Issues in Nuxt

```bash
$ ceviz analyze . --scan-deps --target-deps nuxt,@nuxt/*

⚡ Ceviz Performance Analysis
────────────────────────────────────────────────────────────

📊 Summary
────────────────────────────────────────────────────────────
  Files analyzed:     237
  Total issues:       12
    ● Critical:      5
    ● Warnings:      7
    ● Info:          0
  Performance score:  67/100 👍

🔴 Critical Issues in Nuxt Core
────────────────────────────────────────────────────────────

  ⚡ CRITICAL: Nested loop detected (O(n²) complexity)
     node_modules/.pnpm/nuxt@4.2.0/node_modules/nuxt/dist/core/utils.js:156
     Impact: 100ms → 10s for 1000 items
     → Use Map/Set for O(1) lookups

  📡 CRITICAL: Sync file operation blocks event loop
     node_modules/.pnpm/nuxt@4.2.0/node_modules/nuxt/dist/builder/watch.js:42
     Impact: 50-200ms block per call
     → Use async version: readFile()
```

## What Gets Scanned?

### pnpm Workspaces
- ✅ Scans `node_modules/.pnpm/package@version/`
- ✅ Follows symlinks
- ✅ Excludes nested node_modules

### Filters Applied
- ❌ Skip `.d.ts` files (type definitions)
- ❌ Skip `*.test.ts`, `*.spec.ts`
- ❌ Skip `test/`, `tests/`, `__tests__/` directories
- ❌ Skip `dist/` if it contains build artifacts
- ✅ Analyze source `.ts`, `.js`, `.vue`, `.tsx`, `.jsx`

## Use Cases

### 1. Framework Contributor
You're working on Nuxt core and want to find performance issues:
```bash
cd ~/nuxt/nuxt
ceviz analyze . --scan-deps --target-deps nuxt
```

### 2. Report Issues to Framework
Find performance problems to report:
```bash
cd ~/my-app
ceviz analyze . --scan-deps --target-deps nuxt --json nuxt-issues.json
# Review JSON and create GitHub issues
```

### 3. Compare Frameworks
```bash
ceviz analyze . --scan-deps --target-deps vite
ceviz analyze . --scan-deps --target-deps rollup
# Compare performance characteristics
```

## Technical Details

### Scanner Patterns
```typescript
// For 'nuxt':
[
  'node_modules/nuxt/**/*.{ts,tsx,js,jsx,vue}',
  'node_modules/.pnpm/nuxt@*/**/*.{ts,tsx,js,jsx,vue}'
]

// For '@nuxt/*':
[
  'node_modules/@nuxt/*/**/*.{ts,tsx,js,jsx,vue}',
  'node_modules/.pnpm/@nuxt+*@*/**/*.{ts,tsx,js,jsx,vue}'
]
```

### Default Target Packages
If `--target-deps` not specified:
- nuxt
- @nuxt/*
- vite
- rollup
- vue
- nitropack

## Limitations

1. **Pre-built Packages**: Most npm packages ship compiled JS, not source TS
2. **Minified Code**: Hard to analyze minified production builds
3. **Complex Build Steps**: Some issues only appear in built code
4. **False Positives**: Framework code is heavily optimized, some patterns are intentional

## Best Practices

1. ✅ **Use with source code**: Clone framework repos for best results
2. ✅ **Target specific packages**: Narrow scope with `--target-deps`
3. ✅ **Generate JSON reports**: Use `--json` for creating GitHub issues
4. ✅ **Verify findings**: Not all issues are bugs - frameworks optimize differently
5. ❌ **Don't scan everything**: Avoid `--target-deps *` - too slow and noisy

## Future Enhancements

- [ ] Auto-generate GitHub issue templates
- [ ] Framework-specific rules (e.g., Nuxt-specific patterns)
- [ ] Compare before/after (benchmarking)
- [ ] Integration with framework CI/CD
- [ ] Whitelist known patterns (ignore intentional optimizations)

## Contributing

Found performance issues in a framework? Here's how to report:

1. Run analysis:
   ```bash
   ceviz analyze . --scan-deps --target-deps nuxt --json report.json
   ```

2. Review findings manually

3. Create GitHub issue with:
   - File path and line number
   - Issue description from Ceviz
   - Suggested fix
   - Link to Ceviz report

## Status

✅ **Framework Analysis Mode is ready!**

- Supports pnpm workspaces
- Scans specific packages
- Filters out test files and type definitions
- Works with both user code and framework code

Try it now:
```bash
ceviz analyze . --scan-deps --target-deps nuxt
```
