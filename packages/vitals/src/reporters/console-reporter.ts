import type { AnalysisResult, Issue } from '../types.js'
import chalk from 'chalk'

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
    console.log(chalk.bold.cyan('⚡ Ceviz Performance Analysis'))
    console.log(chalk.gray('─'.repeat(60)))
  }

  private printSummary(result: AnalysisResult): void {
    const { summary } = result

    console.log(`\n${chalk.bold('📊 Summary')}`)
    console.log(chalk.gray('─'.repeat(60)))

    const scoreColor = this.getScoreColor(summary.score)
    const gradeEmoji = this.getGradeEmoji(summary.grade)

    console.log(`  Files analyzed:     ${chalk.white(summary.analyzedFiles)}`)
    console.log(`  Total issues:       ${this.getIssueColor(summary.totalIssues, summary.totalIssues)}`)
    console.log(`    ${chalk.red('●')} Critical:      ${chalk.red(summary.critical)}`)
    console.log(`    ${chalk.yellow('●')} Warnings:      ${chalk.yellow(summary.warnings)}`)
    console.log(`    ${chalk.blue('●')} Info:          ${chalk.blue(summary.info)}`)
    console.log(`  Performance score:  ${scoreColor(summary.score)}/100 ${gradeEmoji}`)
    console.log(`  Analysis time:      ${chalk.white(result.duration)}ms`)
  }

  private printIssues(result: AnalysisResult): void {
    const { issues } = result

    if (issues.length === 0) {
      console.log(`\n${chalk.green.bold('✨ No performance issues found!')}`)
      return
    }

    // Group by severity
    const critical = issues.filter(i => i.severity === 'critical')
    const warnings = issues.filter(i => i.severity === 'warning')

    if (critical.length > 0) {
      console.log(`\n${chalk.bold.red('🔴 Critical Issues')}`)
      console.log(chalk.gray('─'.repeat(60)))
      this.printIssueList(critical.slice(0, 5)) // Show top 5
      if (critical.length > 5) {
        console.log(chalk.gray(`  ... and ${critical.length - 5} more critical issues\n`))
      }
    }

    if (warnings.length > 0 && critical.length < 5) {
      console.log(`\n${chalk.bold.yellow('⚠️  Warnings')}`)
      console.log(chalk.gray('─'.repeat(60)))
      const remaining = 5 - critical.length
      this.printIssueList(warnings.slice(0, remaining))
      if (warnings.length > remaining) {
        console.log(chalk.gray(`  ... and ${warnings.length - remaining} more warnings\n`))
      }
    }
  }

  private printIssueList(issues: Issue[]): void {
    for (const issue of issues) {
      const icon = this.getIssueIcon(issue.category)
      const severity = issue.severity === 'critical' ? chalk.red('CRITICAL') : chalk.yellow('WARNING')

      console.log(`\n  ${icon} ${severity}: ${chalk.white(issue.message)}`)
      console.log(`     ${chalk.gray(issue.location.file)}:${chalk.cyan(issue.location.line)}`)

      if (issue.impact.estimate) {
        console.log(`     Impact: ${chalk.yellow(issue.impact.estimate)}`)
      }

      if (issue.impact.complexity) {
        console.log(`     Complexity: ${chalk.magenta(issue.impact.complexity)}`)
      }

      if (issue.suggestion) {
        console.log(`     ${chalk.green('→')} ${chalk.white(issue.suggestion.fix)}`)
      }
    }
    console.log('')
  }

  private printMetrics(result: AnalysisResult): void {
    const { metrics } = result

    console.log(`\n${chalk.bold('📈 Performance Metrics')}`)
    console.log(chalk.gray('─'.repeat(60)))

    // CPU
    if (metrics.cpu.worstComplexity !== 'O(1)') {
      console.log(`  ${chalk.red('CPU')}`)
      console.log(`    Worst complexity:  ${chalk.magenta(metrics.cpu.worstComplexity)}`)
      if (metrics.cpu.hotspots.length > 0) {
        console.log(`    Hotspots:          ${chalk.yellow(metrics.cpu.hotspots.length)} locations`)
      }
    }

    // Memory
    if (metrics.memory.leaks > 0 || metrics.memory.bloatLevel !== 'low') {
      console.log(`  ${chalk.yellow('Memory')}`)
      console.log(`    Est. baseline:     ${chalk.white(metrics.memory.estimatedBaseline)}`)
      if (metrics.memory.leaks > 0) {
        console.log(`    Memory leaks:      ${chalk.red(metrics.memory.leaks)}`)
      }
      console.log(`    Bloat level:       ${this.getBloatColor(metrics.memory.bloatLevel)}`)
    }

    // Bundle
    if (metrics.bundle.potentialSavings > 0) {
      console.log(`  ${chalk.blue('Bundle')}`)
      console.log(`    Current size:      ${chalk.white(this.formatBytes(metrics.bundle.size))}`)
      console.log(`    Potential savings: ${chalk.green(this.formatBytes(metrics.bundle.potentialSavings))}`)
      if (metrics.bundle.heavyDeps.length > 0) {
        console.log(`    Heavy deps:        ${chalk.yellow(metrics.bundle.heavyDeps.join(', '))}`)
      }
    }

    // I/O
    if (metrics.io.blockingOps > 0 || metrics.io.waterfalls > 0) {
      console.log(`  ${chalk.cyan('I/O')}`)
      if (metrics.io.blockingOps > 0) {
        console.log(`    Blocking ops:      ${chalk.red(metrics.io.blockingOps)}`)
      }
      if (metrics.io.waterfalls > 0) {
        console.log(`    Waterfalls:        ${chalk.yellow(metrics.io.waterfalls)}`)
      }
    }
  }

  private printFooter(result: AnalysisResult): void {
    console.log(`\n${chalk.gray('─'.repeat(60))}`)

    const { summary } = result

    if (summary.critical > 0) {
      console.log(chalk.yellow('\n💡 Quick wins:'))
      console.log(chalk.gray('  1. Fix critical O(n²) loops → use Map/Set for lookups'))
      console.log(chalk.gray('  2. Replace sync file operations → use async versions'))
      console.log(chalk.gray('  3. Clean up memory leaks → add proper cleanup'))
    }
    else if (summary.warnings > 0) {
      console.log(chalk.green('\n✨ Good job! Only minor optimizations remain'))
    }
    else {
      console.log(chalk.green.bold('\n🎉 Perfect! No performance issues detected'))
    }

    console.log(chalk.gray('\n  Run with --json for detailed JSON output'))
    console.log(chalk.gray('  Run with --html for interactive HTML report'))
    console.log('')
  }

  private getScoreColor(score: number) {
    if (score >= 90)
      return chalk.green.bold
    if (score >= 80)
      return chalk.cyan.bold
    if (score >= 70)
      return chalk.yellow.bold
    if (score >= 60)
      return chalk.orange.bold
    return chalk.red.bold
  }

  private getGradeEmoji(grade: string): string {
    const emojis = { A: '🏆', B: '✨', C: '👍', D: '😐', F: '❌' }
    return emojis[grade as keyof typeof emojis] || ''
  }

  private getIssueColor(count: number, value: number) {
    if (count === 0)
      return chalk.green(value)
    if (count < 5)
      return chalk.yellow(value)
    return chalk.red(value)
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
      return chalk.green(level)
    if (level === 'medium')
      return chalk.yellow(level)
    return chalk.red(level)
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024)
      return `${bytes}B`
    if (bytes < 1024 * 1024)
      return `${Math.round(bytes / 1024)}KB`
    return `${Math.round(bytes / 1024 / 1024)}MB`
  }
}
