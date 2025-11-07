import type { Rule as ESLintRule } from 'eslint'

// Re-export Ceviz types
export type { RuleContext as CevizContext, Rule as CevizRule, Issue } from '../../../src/types.js'

// ESLint specific types
export interface ESLintContext {
  getFilename: () => string
  getSourceCode: () => ESLintSourceCode
  report: (descriptor: ESLintReportDescriptor) => void
  options: any[]
  settings: Record<string, any>
}

export interface ESLintSourceCode {
  getText: (node?: any) => string
  getLines: () => string[]
  ast: any
}

export interface ESLintReportDescriptor {
  node: any
  message: string
  data?: Record<string, any>
  fix?: (fixer: any) => any
}

export type ESLintRuleModule = ESLintRule.RuleModule
