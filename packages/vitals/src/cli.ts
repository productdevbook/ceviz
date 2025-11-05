#!/usr/bin/env node

import { Command } from 'commander'
import ora from 'ora'
import chalk from 'chalk'
import { analyzeProject } from './index.js'
import { ConsoleReporter } from './reporters/console-reporter.js'
import { JsonReporter } from './reporters/json-reporter.js'
import { resolve } from 'path'

const program = new Command()

program
  .name('vitals')
  .description('Performance analyzer for Node.js/Nuxt projects')
  .version('0.1.0')

program
  .command('analyze [path]')
  .alias('scan')
  .description('Analyze a project for performance issues')
  .option('-j, --json [file]', 'Output as JSON (optionally to a file)')
  .option('--html [file]', 'Generate HTML report (coming soon)')
  .action(async (projectPath: string = '.', options: any) => {
    const targetPath = resolve(process.cwd(), projectPath)

    const spinner = ora({
      text: chalk.cyan('Scanning project...'),
      color: 'cyan',
    }).start()

    try {
      // Run analysis
      const result = await analyzeProject(targetPath)

      spinner.succeed(chalk.green('Analysis complete!'))

      // Output
      if (options.json) {
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
