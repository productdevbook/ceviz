import type { AnalysisResult, Issue } from '../types.js'
import { colors as consolaTermColors } from 'consola/utils'
import termColors from '../utils/colors.js'
import { logger } from '../utils/logger.js'

export class ConsoleReporter {
  report(result: AnalysisResult): void {
    logger.log('\n')
    this.printHeader()
    this.printSummary(result)
    this.printIssues(result)
    this.printMetrics(result)
    this.printFooter(result)
  }

  private printHeader(): void {
    logger.log(
      consolaTermColors.cyan(consolaTermColors.bold('⚡ Ceviz Performance Analysis')),
    )
    logger.log(consolaTermColors.gray('─'.repeat(60)))
  }

  private printSummary(result: AnalysisResult): void {
    const { summary } = result

    logger.log(`\n${consolaTermColors.bold('📊 Summary')}`)
    logger.log(consolaTermColors.gray('─'.repeat(60)))

    const scoreColor = this.getScoreColor(summary.score)
    const gradeEmoji = this.getGradeEmoji(summary.grade)

    logger.log(
      `  Files analyzed:     ${consolaTermColors.white(String(summary.analyzedFiles))}`,
    )
    logger.log(
      `  Total issues:       ${this.getIssueColor(summary.totalIssues, summary.totalIssues)}`,
    )
    logger.log(
      `    ${consolaTermColors.red('●')} Critical:      ${consolaTermColors.red(String(summary.critical))}`,
    )
    logger.log(
      `    ${consolaTermColors.yellow('●')} Warnings:      ${consolaTermColors.yellow(String(summary.warnings))}`,
    )
    logger.log(
      `    ${consolaTermColors.blue('●')} Info:          ${consolaTermColors.blue(String(summary.info))}`,
    )
    logger.log(`  Performance score:  ${scoreColor}/100 ${gradeEmoji}`)
    logger.log(
      `  Analysis time:      ${consolaTermColors.white(String(result.duration))}ms`,
    )
  }

  private printIssues(result: AnalysisResult): void {
    const { issues } = result

    if (issues.length === 0) {
      logger.log(
        `\n${consolaTermColors.green(consolaTermColors.bold('✨ No performance issues found!'))}`,
      )
      return
    }

    // Group by severity
    const critical = issues.filter(i => i.severity === 'critical')
    const warnings = issues.filter(i => i.severity === 'warning')

    if (critical.length > 0) {
      logger.log(`\n${consolaTermColors.red(consolaTermColors.bold('🔴 Critical Issues'))}`)
      logger.log(consolaTermColors.gray('─'.repeat(60)))
      this.printIssueList(critical.slice(0, 5)) // Show top 5
      if (critical.length > 5) {
        logger.log(
          consolaTermColors.gray(
            `  ... and ${critical.length - 5} more critical issues\n`,
          ),
        )
      }
    }

    if (warnings.length > 0 && critical.length < 5) {
      logger.log(`\n${consolaTermColors.yellow(consolaTermColors.bold('⚠️  Warnings'))}`)
      logger.log(consolaTermColors.gray('─'.repeat(60)))
      const remaining = 5 - critical.length
      this.printIssueList(warnings.slice(0, remaining))
      if (warnings.length > remaining) {
        logger.log(
          consolaTermColors.gray(
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
          ? consolaTermColors.red('CRITICAL')
          : consolaTermColors.yellow('WARNING')

      logger.log(
        `\n  ${icon} ${severity}: ${consolaTermColors.white(issue.message)}`,
      )
      logger.log(
        `     ${consolaTermColors.gray(issue.location.file)}:${consolaTermColors.cyan(String(issue.location.line))}`,
      )

      if (issue.impact.estimate) {
        logger.log(`     Impact: ${consolaTermColors.yellow(issue.impact.estimate)}`)
      }

      if (issue.impact.complexity) {
        logger.log(
          `     Complexity: ${consolaTermColors.magenta(issue.impact.complexity)}`,
        )
      }

      if (issue.suggestion) {
        logger.log(
          `     ${consolaTermColors.green('→')} ${consolaTermColors.white(issue.suggestion.fix)}`,
        )
      }
    }
    logger.log('')
  }

  private printMetrics(result: AnalysisResult): void {
    const { metrics } = result

    logger.log(`\n${consolaTermColors.bold('📈 Performance Metrics')}`)
    logger.log(consolaTermColors.gray('─'.repeat(60)))

    // CPU
    if (metrics.cpu.worstComplexity !== 'O(1)') {
      logger.log(`  ${consolaTermColors.red('CPU')}`)
      logger.log(
        `    Worst complexity:  ${consolaTermColors.magenta(metrics.cpu.worstComplexity)}`,
      )
      if (metrics.cpu.hotspots.length > 0) {
        logger.log(
          `    Hotspots:          ${consolaTermColors.yellow(String(metrics.cpu.hotspots.length))} locations`,
        )
      }
    }

    // Memory
    if (metrics.memory.leaks > 0 || metrics.memory.bloatLevel !== 'low') {
      logger.log(`  ${consolaTermColors.yellow('Memory')}`)
      logger.log(
        `    Est. baseline:     ${consolaTermColors.white(metrics.memory.estimatedBaseline)}`,
      )
      if (metrics.memory.leaks > 0) {
        logger.log(
          `    Memory leaks:      ${consolaTermColors.red(String(metrics.memory.leaks))}`,
        )
      }
      logger.log(
        `    Bloat level:       ${this.getBloatColor(metrics.memory.bloatLevel)}`,
      )
    }

    // Bundle
    if (metrics.bundle.potentialSavings > 0) {
      logger.log(`  ${consolaTermColors.blue('Bundle')}`)
      logger.log(
        `    Current size:      ${consolaTermColors.white(this.formatBytes(metrics.bundle.size))}`,
      )
      logger.log(
        `    Potential savings: ${consolaTermColors.green(this.formatBytes(metrics.bundle.potentialSavings))}`,
      )
      if (metrics.bundle.heavyDeps.length > 0) {
        logger.log(
          `    Heavy deps:        ${consolaTermColors.yellow(metrics.bundle.heavyDeps.join(', '))}`,
        )
      }
    }

    // I/O
    if (metrics.io.blockingOps > 0 || metrics.io.waterfalls > 0) {
      logger.log(`  ${consolaTermColors.cyan('I/O')}`)
      if (metrics.io.blockingOps > 0) {
        logger.log(
          `    Blocking ops:      ${consolaTermColors.red(String(metrics.io.blockingOps))}`,
        )
      }
      if (metrics.io.waterfalls > 0) {
        logger.log(
          `    Waterfalls:        ${consolaTermColors.yellow(String(metrics.io.waterfalls))}`,
        )
      }
    }
  }

  private printFooter(result: AnalysisResult): void {
    logger.log(`\n${consolaTermColors.gray('─'.repeat(60))}`)

    const { summary } = result

    if (summary.critical > 0) {
      logger.log(consolaTermColors.yellow('\n💡 Quick wins:'))
      logger.log(
        consolaTermColors.gray(
          '  1. Fix critical O(n²) loops → use Map/Set for lookups',
        ),
      )
      logger.log(
        consolaTermColors.gray(
          '  2. Replace sync file operations → use async versions',
        ),
      )
      logger.log(
        consolaTermColors.gray('  3. Clean up memory leaks → add proper cleanup'),
      )
    }
    else if (summary.warnings > 0) {
      logger.log(
        consolaTermColors.green('\n✨ Good job! Only minor optimizations remain'),
      )
    }
    else {
      logger.log(
        consolaTermColors.green(
          consolaTermColors.bold('\n🎉 Perfect! No performance issues detected'),
        ),
      )
    }

    logger.log(
      consolaTermColors.gray('\n  Run with --json for detailed JSON output'),
    )
    logger.log(
      consolaTermColors.gray('  Run with --html for interactive HTML report'),
    )
    logger.log('')
  }

  private getScoreColor(score: number) {
    const value = String(score)

    if (score >= 90)
      return consolaTermColors.green(consolaTermColors.bold(value))
    if (score >= 80)
      return consolaTermColors.cyan(consolaTermColors.bold(value))
    if (score >= 70)
      return consolaTermColors.yellow(consolaTermColors.bold(value))
    if (score >= 60)
      return consolaTermColors.bold(termColors.orange(value))
    return consolaTermColors.red(consolaTermColors.bold(value))
  }

  private getGradeEmoji(grade: string): string {
    const emojis = { A: '🏆', B: '✨', C: '👍', D: '😐', F: '❌' }
    return emojis[grade as keyof typeof emojis] || ''
  }

  private getIssueColor(count: number, value: number) {
    if (count === 0)
      return consolaTermColors.green(String(value))
    if (count < 5)
      return consolaTermColors.yellow(String(value))
    return consolaTermColors.red(String(value))
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
      return consolaTermColors.green(level)
    if (level === 'medium')
      return consolaTermColors.yellow(level)
    return consolaTermColors.red(level)
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024)
      return `${bytes}B`
    if (bytes < 1024 * 1024)
      return `${Math.round(bytes / 1024)}KB`
    return `${Math.round(bytes / 1024 / 1024)}MB`
  }
}
