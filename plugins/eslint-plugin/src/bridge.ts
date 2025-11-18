import type { RuleContext as CevizRuleContext } from 'ceviz'
import type { Rule } from 'eslint'
import fs from 'node:fs'
import path from 'node:path'
import { parseSync } from 'oxc-parser'

export function createCevizContext(
  eslintContext: Rule.RuleContext,
): CevizRuleContext {
  const filename = eslintContext.filename || eslintContext.getFilename()
  const sourceCode = eslintContext.sourceCode || eslintContext.getSourceCode()
  const code = sourceCode.text

  const ast = parseSync(filename, code, { sourceType: 'module' })
  const projectRoot = findProjectRoot(filename)

  return {
    ast: ast.program,
    code,
    filePath: filename,
    fileContent: code,
    projectRoot,
    isNuxt: detectNuxt(projectRoot),
    isVue: filename.endsWith('.vue'),
    isTS: filename.endsWith('.ts') || filename.endsWith('.tsx'),
  }
}

function findProjectRoot(filePath: string): string {
  let dir = path.dirname(filePath)

  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir
    }
    dir = path.dirname(dir)
  }

  return process.cwd()
}

function detectNuxt(projectRoot: string): boolean {
  try {
    const pkgPath = path.join(projectRoot, 'package.json')
    if (!fs.existsSync(pkgPath))
      return false

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    return !!(
      pkg.dependencies?.nuxt
      || pkg.devDependencies?.nuxt
      || pkg.dependencies?.['@nuxt/kit']
      || pkg.devDependencies?.['@nuxt/kit']
    )
  }
  catch {
    return false
  }
}
