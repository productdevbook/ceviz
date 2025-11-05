import { glob } from 'glob'
import { readFileSync, statSync } from 'fs'
import { join, relative } from 'path'
import type { ProjectContext } from './types.js'

export class ProjectScanner {
  private projectRoot: string

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
  }

  /**
   * Detect project context (framework, dependencies, etc.)
   */
  async detectProject(): Promise<ProjectContext> {
    const packageJsonPath = join(this.projectRoot, 'package.json')
    let packageJson: any = {}

    try {
      packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    } catch {
      // No package.json found
    }

    const deps = packageJson.dependencies || {}
    const devDeps = packageJson.devDependencies || {}
    const allDeps = { ...deps, ...devDeps }

    const isNuxt = !!allDeps.nuxt || !!allDeps['@nuxt/kit']
    const isVite = !!allDeps.vite
    const isNext = !!allDeps.next
    const isVue = !!allDeps.vue || isNuxt
    const isReact = !!allDeps.react || isNext

    let framework = 'unknown'
    if (isNuxt) framework = 'nuxt'
    else if (isNext) framework = 'next'
    else if (isVue) framework = 'vue'
    else if (isReact) framework = 'react'
    else if (isVite) framework = 'vite'

    return {
      root: this.projectRoot,
      packageJson,
      isNuxt,
      isVite,
      framework,
      dependencies: deps,
      devDependencies: devDeps,
    }
  }

  /**
   * Find all source files to analyze
   * EXCLUDES: node_modules, dist, .nuxt, .output, etc.
   */
  async findSourceFiles(): Promise<string[]> {
    const patterns = [
      '**/*.{ts,tsx,js,jsx,vue}',
      '!node_modules/**',
      '!dist/**',
      '!.nuxt/**',
      '!.output/**',
      '!.next/**',
      '!build/**',
      '!coverage/**',
      '!.git/**',
    ]

    const files = await glob(patterns, {
      cwd: this.projectRoot,
      absolute: true,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.nuxt/**',
        '**/.output/**',
        '**/.next/**',
        '**/build/**',
        '**/coverage/**',
      ]
    })

    return files
  }

  /**
   * Get file statistics
   */
  getFileStats(filePath: string) {
    const stats = statSync(filePath)
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').length

    return {
      size: stats.size,
      lines,
      content,
      relativePath: relative(this.projectRoot, filePath),
    }
  }

  /**
   * Categorize files by type
   */
  categorizeFiles(files: string[]) {
    const categories = {
      vue: [] as string[],
      typescript: [] as string[],
      javascript: [] as string[],
      server: [] as string[],
      components: [] as string[],
      composables: [] as string[],
      middleware: [] as string[],
      pages: [] as string[],
      api: [] as string[],
    }

    for (const file of files) {
      const rel = relative(this.projectRoot, file)

      if (file.endsWith('.vue')) {
        categories.vue.push(file)
        if (rel.includes('components/')) categories.components.push(file)
        if (rel.includes('pages/')) categories.pages.push(file)
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        categories.typescript.push(file)
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        categories.javascript.push(file)
      }

      if (rel.includes('server/') || rel.includes('/api/')) {
        categories.server.push(file)
        if (rel.includes('/api/')) categories.api.push(file)
      }
      if (rel.includes('composables/')) categories.composables.push(file)
      if (rel.includes('middleware/')) categories.middleware.push(file)
    }

    return categories
  }
}
