import type { ScanOptions } from './scanner.js'
import type { AnalysisResult } from './types.js'
import { CodeAnalyzer } from './analyzer.js'
import { allRules } from './rules/index.js'
import { ProjectScanner } from './scanner.js'

export { CodeAnalyzer } from './analyzer.js'
export { defineConfig, mergeConfig, resolveConfig } from './config.js'
export { allRules } from './rules/index.js'
export { ProjectScanner, type ScanOptions } from './scanner.js'
export * from './types.js'

export interface AnalyzeOptions extends ScanOptions {
  // Future options can be added here
}

/**
 * Main entry point for Ceviz analyzer
 *
 * @param projectRoot - Path to project root
 * @param options - Analysis options
 *   - scanDeps: Set to true to analyze framework code in node_modules
 *   - targetDeps: Array of package names to scan (e.g., ['nuxt', 'vite'])
 */
export async function analyzeProject(
  projectRoot: string,
  options: AnalyzeOptions = {},
): Promise<AnalysisResult> {
  // 1. Scan project
  const scanner = new ProjectScanner(projectRoot, options)
  const projectContext = await scanner.detectProject()
  const files = await scanner.findSourceFiles()

  // 2. Analyze files
  const analyzer = new CodeAnalyzer(projectContext, allRules)
  const result = await analyzer.analyzeFiles(files)

  return result
}
