#!/usr/bin/env node

import { Command } from 'commander'
import ora from 'ora'
import chalk from 'chalk'
import { analyzeProject } from './index.js'
import { resolveConfig, mergeConfig } from './config.js'
import { ConsoleReporter } from './reporters/console-reporter.js'
import { JsonReporter } from './reporters/json-reporter.js'
import { HtmlReporter } from './reporters/html-reporter.js'
import { resolve } from 'path'

const program = new Command()

program
  .name('ceviz')
  .description('⚡ Ceviz - Lightning-fast performance analyzer for Node.js/Nuxt projects')
  .version('0.1.0')

program
  .command('analyze [path]')
  .alias('scan')
  .description('Analyze a project for performance issues')
  .option('-c, --config <file>', 'Path to config file (default: ceviz.config.ts)')
  .option('-j, --json [file]', 'Output as JSON (optionally to a file)')
  .option('--html [file]', 'Generate interactive HTML report (auto-opens in browser)')
  .option('--scan-deps', 'Analyze framework code in node_modules (for framework contributors)')
  .option('--target-deps <packages>', 'Comma-separated list of packages to scan (e.g., nuxt,vite)', (val) => val.split(','))
  .action(async (projectPath: string = '.', options: any) => {
    const targetPath = resolve(process.cwd(), projectPath)

    // Load config file
    const fileConfig = await resolveConfig(targetPath)

    // Merge with CLI options
    const config = mergeConfig(fileConfig, {
      scanDeps: options.scanDeps,
      targetDeps: options.targetDeps,
    })

    const spinner = ora({
      text: config.scanDeps
        ? chalk.cyan('Scanning framework code in node_modules...')
        : chalk.cyan('Scanning project...'),
      color: 'cyan',
    }).start()

    try {
      // Run analysis
      const result = await analyzeProject(targetPath, {
        scanDeps: config.scanDeps,
        targetDeps: config.targetDeps,
      })

      spinner.succeed(chalk.green('Analysis complete!'))

      // Output
      if (options.html) {
        const htmlReporter = new HtmlReporter()
        const outputPath = typeof options.html === 'string' ? options.html : 'vitals-report.html'
        await htmlReporter.report(result, outputPath, true)
      } else if (options.json) {
        const jsonReporter = new JsonReporter()
        const outputPath = typeof options.json === 'string' ? options.json : undefined
        jsonReporter.report(result, outputPath)
      } else {
        const consoleReporter = new ConsoleReporter()
        consoleReporter.report(result)
      }

      // Exit code based on severity
      if (result.summary.critical > 0) {
        process.exit(1)
      } else if (result.summary.warnings > 5) {
        process.exit(1)
      } else {
        process.exit(0)
      }
    } catch (error) {
      spinner.fail(chalk.red('Analysis failed'))
      console.error(chalk.red('\n❌ Error:'), error)
      process.exit(1)
    }
  })

program.parse()
