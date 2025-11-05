import type { AnalysisResult } from '../types.js'
import { writeFileSync } from 'node:fs'

export class JsonReporter {
  report(result: AnalysisResult, outputPath?: string): void {
    const json = JSON.stringify(result, null, 2)

    if (outputPath) {
      writeFileSync(outputPath, json, 'utf-8')
      console.log(`\n✅ JSON report saved to: ${outputPath}\n`)
    }
    else {
      console.log(json)
    }
  }
}
