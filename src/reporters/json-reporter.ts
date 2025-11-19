import type { AnalysisResult } from '../types.js'
import { writeFileSync } from 'node:fs'
import { logger } from '../utils/logger.js'
export class JsonReporter {
  report(result: AnalysisResult, outputPath?: string): void {
    const json = JSON.stringify(result, null, 2)

    if (outputPath) {
      writeFileSync(outputPath, json, 'utf-8')
      logger.log(`\n✅ JSON report saved to: ${outputPath}\n`)
    }
    else {
      logger.log(json)
    }
  }
}
