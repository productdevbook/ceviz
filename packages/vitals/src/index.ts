import { ProjectScanner } from './scanner.js'
import { CodeAnalyzer } from './analyzer.js'
import { allRules } from './rules/index.js'
import type { AnalysisResult, ProjectContext } from './types.js'

export * from './types.js'
export { allRules } from './rules/index.js'
export { ProjectScanner } from './scanner.js'
export { CodeAnalyzer } from './analyzer.js'

/**
 * Main entry point for Vitals analyzer
 */
export async function analyzeProject(projectRoot: string): Promise<AnalysisResult> {
  // 1. Scan project
  const scanner = new ProjectScanner(projectRoot)
  const projectContext = await scanner.detectProject()
  const files = await scanner.findSourceFiles()

  // 2. Analyze files
  const analyzer = new CodeAnalyzer(projectContext, allRules)
  const result = await analyzer.analyzeFiles(files)

  return result
}
