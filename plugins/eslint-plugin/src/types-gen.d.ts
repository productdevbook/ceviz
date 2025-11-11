/* prettier-ignore */
import type { Linter } from 'eslint'

declare module 'eslint' {
  namespace Linter {
    interface RulesRecord extends RuleOptions {}
  }
}

export interface RuleOptions {
  /**
   * Detects array.find() inside loops creating O(n*m) complexity
   */
  'ceviz/array-find-in-loop'?: Linter.RuleEntry<[]>
  /**
   * Detects unclosed intervals/timeouts causing memory leaks
   */
  'ceviz/memory-leak-interval'?: Linter.RuleEntry<[]>
  /**
   * Detects nested loops that cause O(n²) or worse complexity
   */
  'ceviz/nested-loops'?: Linter.RuleEntry<[]>
  /**
   * Detects sequential async operations that could be parallelized
   */
  'ceviz/sequential-requests'?: Linter.RuleEntry<[]>
  /**
   * Detects blocking synchronous file operations
   */
  'ceviz/sync-file-operations'?: Linter.RuleEntry<[]>
}

/* ======= Declarations ======= */
