import type { AnalysisResult, Issue } from '../types.js'
import termColors from '../utils/colors.js'

export class ConsoleReporter {
  report(result: AnalysisResult): void {
    console.log('\n')
    this.printHeader()
    this.printSummary(result)
    this.printIssues(result)
    this.printMetrics(result)
    this.printFooter(result)
  }

  private printHeader(): void {
    console.log(
      termColors.cyan(termColors.bold('⚡ Ceviz Performance Analysis')),
    )
    console.log(termColors.gray('─'.repeat(60)))
  }

  private printSummary(result: AnalysisResult): void {
    const { summary } = result

    console.log(`\n${termColors.bold('📊 Summary')}`)
    console.log(termColors.gray('─'.repeat(60)))

    const scoreColor = this.getScoreColor(summary.score)
    const gradeEmoji = this.getGradeEmoji(summary.grade)

    console.log(
      `  Files analyzed:     ${termColors.white(String(summary.analyzedFiles))}`,
    )
    console.log(
      `  Total issues:       ${this.getIssueColor(summary.totalIssues, summary.totalIssues)}`,
    )
    console.log(
      `    ${termColors.red('●')} Critical:      ${termColors.red(String(summary.critical))}`,
    )
    console.log(
      `    ${termColors.yellow('●')} Warnings:      ${termColors.yellow(String(summary.warnings))}`,
    )
    console.log(
      `    ${termColors.blue('●')} Info:          ${termColors.blue(String(summary.info))}`,
    )
    console.log(`  Performance score:  ${scoreColor}/100 ${gradeEmoji}`)
    console.log(
      `  Analysis time:      ${termColors.white(String(result.duration))}ms`,
    )
  }

  private printIssues(result: AnalysisResult): void {
    const { issues } = result

    if (issues.length === 0) {
      console.log(
        `\n${termColors.green(termColors.bold('✨ No performance issues found!'))}`,
      )
      return
    }

    // Group by severity
    const critical = issues.filter(i => i.severity === 'critical')
    const warnings = issues.filter(i => i.severity === 'warning')

    if (critical.length > 0) {
      console.log(`\n${termColors.red(termColors.bold('🔴 Critical Issues'))}`)
      console.log(termColors.gray('─'.repeat(60)))
      this.printIssueList(critical.slice(0, 5)) // Show top 5
      if (critical.length > 5) {
        console.log(
          termColors.gray(
            `  ... and ${critical.length - 5} more critical issues\n`,
          ),
        )
      }
    }

    if (warnings.length > 0 && critical.length < 5) {
      console.log(`\n${termColors.yellow(termColors.bold('⚠️  Warnings'))}`)
      console.log(termColors.gray('─'.repeat(60)))
      const remaining = 5 - critical.length
      this.printIssueList(warnings.slice(0, remaining))
      if (warnings.length > remaining) {
        console.log(
          termColors.gray(
            `  ... and ${warnings.length - remaining} more warnings\n`,
          ),
        )
      }
    }
  }

  private printIssueList(issues: Issue[]): void {
    for (const issue of issues) {
      const icon = this.getIssueIcon(issue.category)
      const severity
        = issue.severity === 'critical'
          ? termColors.red('CRITICAL')
          : termColors.yellow('WARNING')

      console.log(
        `\n  ${icon} ${severity}: ${termColors.white(issue.message)}`,
      )
      console.log(
        `     ${termColors.gray(issue.location.file)}:${termColors.cyan(String(issue.location.line))}`,
      )

      if (issue.impact.estimate) {
        console.log(`     Impact: ${termColors.yellow(issue.impact.estimate)}`)
      }

      if (issue.impact.complexity) {
        console.log(
          `     Complexity: ${termColors.magenta(issue.impact.complexity)}`,
        )
      }

      if (issue.suggestion) {
        console.log(
          `     ${termColors.green('→')} ${termColors.white(issue.suggestion.fix)}`,
        )
      }
    }
    console.log('')
  }

  private printMetrics(result: AnalysisResult): void {
    const { metrics } = result

    console.log(`\n${termColors.bold('📈 Performance Metrics')}`)
    console.log(termColors.gray('─'.repeat(60)))

    // CPU
    if (metrics.cpu.worstComplexity !== 'O(1)') {
      console.log(`  ${termColors.red('CPU')}`)
      console.log(
        `    Worst complexity:  ${termColors.magenta(metrics.cpu.worstComplexity)}`,
      )
      if (metrics.cpu.hotspots.length > 0) {
        console.log(
          `    Hotspots:          ${termColors.yellow(String(metrics.cpu.hotspots.length))} locations`,
        )
      }
    }

    // Memory
    if (metrics.memory.leaks > 0 || metrics.memory.bloatLevel !== 'low') {
      console.log(`  ${termColors.yellow('Memory')}`)
      console.log(
        `    Est. baseline:     ${termColors.white(metrics.memory.estimatedBaseline)}`,
      )
      if (metrics.memory.leaks > 0) {
        console.log(
          `    Memory leaks:      ${termColors.red(String(metrics.memory.leaks))}`,
        )
      }
      console.log(
        `    Bloat level:       ${this.getBloatColor(metrics.memory.bloatLevel)}`,
      )
    }

    // Bundle
    if (metrics.bundle.potentialSavings > 0) {
      console.log(`  ${termColors.blue('Bundle')}`)
      console.log(
        `    Current size:      ${termColors.white(this.formatBytes(metrics.bundle.size))}`,
      )
      console.log(
        `    Potential savings: ${termColors.green(this.formatBytes(metrics.bundle.potentialSavings))}`,
      )
      if (metrics.bundle.heavyDeps.length > 0) {
        console.log(
          `    Heavy deps:        ${termColors.yellow(metrics.bundle.heavyDeps.join(', '))}`,
        )
      }
    }

    // I/O
    if (metrics.io.blockingOps > 0 || metrics.io.waterfalls > 0) {
      console.log(`  ${termColors.cyan('I/O')}`)
      if (metrics.io.blockingOps > 0) {
        console.log(
          `    Blocking ops:      ${termColors.red(String(metrics.io.blockingOps))}`,
        )
      }
      if (metrics.io.waterfalls > 0) {
        console.log(
          `    Waterfalls:        ${termColors.yellow(String(metrics.io.waterfalls))}`,
        )
      }
    }
  }

  private printFooter(result: AnalysisResult): void {
    console.log(`\n${termColors.gray('─'.repeat(60))}`)

    const { summary } = result

    if (summary.critical > 0) {
      console.log(termColors.yellow('\n💡 Quick wins:'))
      console.log(
        termColors.gray(
          '  1. Fix critical O(n²) loops → use Map/Set for lookups',
        ),
      )
      console.log(
        termColors.gray(
          '  2. Replace sync file operations → use async versions',
        ),
      )
      console.log(
        termColors.gray('  3. Clean up memory leaks → add proper cleanup'),
      )
    }
    else if (summary.warnings > 0) {
      console.log(
        termColors.green('\n✨ Good job! Only minor optimizations remain'),
      )
    }
    else {
      console.log(
        termColors.green(
          termColors.bold('\n🎉 Perfect! No performance issues detected'),
        ),
      )
    }

    console.log(
      termColors.gray('\n  Run with --json for detailed JSON output'),
    )
    console.log(
      termColors.gray('  Run with --html for interactive HTML report'),
    )
    console.log('')
  }

  private getScoreColor(score: number) {
    const value = String(score)

    if (score >= 90)
      return termColors.green(termColors.bold(value))
    if (score >= 80)
      return termColors.cyan(termColors.bold(value))
    if (score >= 70)
      return termColors.yellow(termColors.bold(value))
    if (score >= 60)
      return termColors.orange(termColors.bold(value))
    return termColors.red(termColors.bold(value))
  }

  private getGradeEmoji(grade: string): string {
    const emojis = { A: '🏆', B: '✨', C: '👍', D: '😐', F: '❌' }
    return emojis[grade as keyof typeof emojis] || ''
  }

  private getIssueColor(count: number, value: number) {
    if (count === 0)
      return termColors.green(String(value))
    if (count < 5)
      return termColors.yellow(String(value))
    return termColors.red(String(value))
  }

  private getIssueIcon(category: string): string {
    const icons = {
      cpu: '⚡',
      memory: '💾',
      io: '📡',
      bundle: '📦',
      framework: '🔧',
    }
    return icons[category as keyof typeof icons] || '●'
  }

  private getBloatColor(level: string): string {
    if (level === 'low')
      return termColors.green(level)
    if (level === 'medium')
      return termColors.yellow(level)
    return termColors.red(level)
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024)
      return `${bytes}B`
    if (bytes < 1024 * 1024)
      return `${Math.round(bytes / 1024)}KB`
    return `${Math.round(bytes / 1024 / 1024)}MB`
  }
}
