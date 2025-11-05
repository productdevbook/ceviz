import type { AnalysisResult, FileAnalysis, Issue, Metrics, ProjectContext, Rule, RuleContext, Summary } from './types.js'
import { readFileSync } from 'node:fs'
import { parseAsync } from 'oxc-parser'

export class CodeAnalyzer {
  private rules: Rule[] = []
  private projectContext: ProjectContext

  constructor(projectContext: ProjectContext, rules: Rule[]) {
    this.projectContext = projectContext
    this.rules = rules.filter(r => r.enabled)
  }

  /**
   * Analyze a single file
   */
  async analyzeFile(filePath: string): Promise<FileAnalysis> {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').length

    let parseResult: any
    try {
      // Parse with OXC (super fast!)
      parseResult = await parseAsync(filePath, content, {
        sourceType: 'module',
      })
    }
    catch {
      // Parse error - skip file
      return {
        path: filePath,
        size: content.length,
        lines,
        complexity: 'unknown',
        issues: [],
      }
    }

    const ast = parseResult.program

    const context: RuleContext = {
      ast,
      code: content,
      filePath,
      fileContent: content,
      projectRoot: this.projectContext.root,
      isNuxt: this.projectContext.isNuxt,
      isVue: filePath.endsWith('.vue'),
      isTS: filePath.endsWith('.ts') || filePath.endsWith('.tsx'),
    }

    // Run all rules on this file
    const issues: Issue[] = []
    for (const rule of this.rules) {
      try {
        const ruleIssues = rule.check(context)
        issues.push(...ruleIssues)
      }
      catch (error) {
        console.error(`Rule ${rule.id} failed on ${filePath}:`, error)
      }
    }

    // Calculate complexity
    const complexity = this.calculateComplexity(ast.program)

    return {
      path: filePath,
      size: content.length,
      lines,
      complexity,
      issues,
    }
  }

  /**
   * Analyze multiple files
   */
  async analyzeFiles(files: string[]): Promise<AnalysisResult> {
    const startTime = Date.now()
    const fileAnalyses: FileAnalysis[] = []
    const allIssues: Issue[] = []

    for (const file of files) {
      const analysis = await this.analyzeFile(file)
      fileAnalyses.push(analysis)
      allIssues.push(...analysis.issues)
    }

    const duration = Date.now() - startTime

    // Calculate summary
    const critical = allIssues.filter(i => i.severity === 'critical').length
    const warnings = allIssues.filter(i => i.severity === 'warning').length
    const info = allIssues.filter(i => i.severity === 'info').length

    // Calculate score (0-100)
    // Critical = -10 points, Warning = -3 points, Info = -1 point
    let score = 100
    score -= critical * 10
    score -= warnings * 3
    score -= info * 1
    score = Math.max(0, score)

    let grade: 'A' | 'B' | 'C' | 'D' | 'F'
    if (score >= 90)
      grade = 'A'
    else if (score >= 80)
      grade = 'B'
    else if (score >= 70)
      grade = 'C'
    else if (score >= 60)
      grade = 'D'
    else grade = 'F'

    const summary: Summary = {
      totalFiles: files.length,
      analyzedFiles: fileAnalyses.length,
      totalIssues: allIssues.length,
      critical,
      warnings,
      info,
      score,
      grade,
    }

    // Calculate metrics
    const metrics = this.calculateMetrics(fileAnalyses, allIssues)

    return {
      summary,
      issues: allIssues,
      metrics,
      files: fileAnalyses,
      timestamp: new Date().toISOString(),
      duration,
    }
  }

  /**
   * Calculate overall metrics
   */
  private calculateMetrics(files: FileAnalysis[], issues: Issue[]): Metrics {
    // CPU metrics
    const cpuIssues = issues.filter(i => i.category === 'cpu')
    const complexities = files.map(f => f.complexity).filter(c => c !== 'unknown')
    const worstComplexity = this.getWorstComplexity(complexities)
    const hotspots = cpuIssues
      .filter(i => i.severity === 'critical')
      .map(i => i.location)
      .slice(0, 10)

    // Memory metrics
    const memoryIssues = issues.filter(i => i.category === 'memory')
    const leaks = memoryIssues.filter(i => i.impact.type === 'memory').length
    const bloatLevel = memoryIssues.length > 10 ? 'high' : memoryIssues.length > 5 ? 'medium' : 'low'

    // Bundle metrics
    const bundleIssues = issues.filter(i => i.category === 'bundle')
    const potentialSavings = bundleIssues.reduce((sum, i) => {
      // Extract size from estimate like "70KB" or "230KB"
      const match = i.impact.estimate?.match(/(\d+)KB/)
      return sum + (match ? Number.parseInt(match[1]) * 1024 : 0)
    }, 0)

    const heavyDeps = bundleIssues
      .filter(i => i.suggestion?.alternatives)
      .map(i => i.message.match(/['"](.*?)['"]/)?.[1])
      .filter(Boolean) as string[]

    // I/O metrics
    const ioIssues = issues.filter(i => i.category === 'io')
    const blockingOps = ioIssues.filter(i => i.impact.blocking).length
    const waterfalls = ioIssues.filter(i => i.message.includes('sequential')).length

    return {
      cpu: {
        worstComplexity,
        averageComplexity: 'O(n)', // TODO: Calculate properly
        hotspots,
      },
      memory: {
        estimatedBaseline: this.estimateMemoryUsage(files),
        leaks,
        bloatLevel,
      },
      bundle: {
        size: files.reduce((sum, f) => sum + f.size, 0),
        potentialSavings,
        heavyDeps,
      },
      io: {
        blockingOps,
        waterfalls,
      },
    }
  }

  /**
   * Calculate cyclomatic complexity
   */
  private calculateComplexity(ast: any): string {
    // Simple complexity calculation
    let complexity = 1

    const countNodes = (node: any) => {
      if (!node || typeof node !== 'object')
        return

      if (node.type === 'IfStatement'
        || node.type === 'ConditionalExpression'
        || node.type === 'SwitchCase'
        || node.type === 'ForStatement'
        || node.type === 'WhileStatement'
        || node.type === 'DoWhileStatement'
        || node.type === 'LogicalExpression') {
        complexity++
      }

      // Recursively check all properties
      for (const key in node) {
        if (key === 'type' || key === 'loc' || key === 'range')
          continue
        const value = node[key]
        if (Array.isArray(value)) {
          value.forEach(countNodes)
        }
        else if (typeof value === 'object') {
          countNodes(value)
        }
      }
    }

    countNodes(ast)

    if (complexity <= 5)
      return 'O(1)'
    if (complexity <= 10)
      return 'O(n)'
    if (complexity <= 20)
      return 'O(n log n)'
    return 'O(n²)'
  }

  private getWorstComplexity(complexities: string[]): string {
    const order = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2^n)']
    let worst = 'O(1)'

    for (const c of complexities) {
      const currentIndex = order.indexOf(c)
      const worstIndex = order.indexOf(worst)
      if (currentIndex > worstIndex) {
        worst = c
      }
    }

    return worst
  }

  private estimateMemoryUsage(files: FileAnalysis[]): string {
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    const estimated = totalSize * 3 // Rough estimate: 3x source code size

    if (estimated < 1024 * 1024) {
      return `${Math.round(estimated / 1024)}KB`
    }
    return `${Math.round(estimated / 1024 / 1024)}MB`
  }
}
