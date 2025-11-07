import type { CevizContext, ESLintContext } from './types.js'

/**
 * Bridge: Convert ESLint context to Ceviz context
 * This allows Ceviz rules to run in ESLint
 */
export function createCevizContext(eslintContext: ESLintContext): CevizContext {
  const sourceCode = eslintContext.getSourceCode()
  const filePath = eslintContext.getFilename()
  const code = sourceCode.getText()

  return {
    ast: sourceCode.ast,
    code,
    filePath,
    fileContent: code,
    projectRoot: process.cwd(),
    isNuxt: false, // TODO: detect from project
    isVue: filePath.endsWith('.vue'),
    isTS: filePath.endsWith('.ts') || filePath.endsWith('.tsx'),
  }
}
