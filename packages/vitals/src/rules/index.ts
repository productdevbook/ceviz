import type { Rule } from '../types.js'
import { arrayFindInLoopRule } from './cpu/array-find-in-loop.js'
import { nestedLoopsRule } from './cpu/nested-loops.js'
import { sequentialRequestsRule } from './io/sequential-requests.js'
import { syncFileOperationsRule } from './io/sync-file-operations.js'
import { memoryLeakIntervalRule } from './memory/memory-leak-interval.js'

export const allRules: Rule[] = [
  // CPU rules
  nestedLoopsRule,
  arrayFindInLoopRule,

  // Memory rules
  memoryLeakIntervalRule,

  // I/O rules
  syncFileOperationsRule,
  sequentialRequestsRule,
]

export function getRuleById(id: string): Rule | undefined {
  return allRules.find(r => r.id === id)
}

export function getRulesByCategory(category: string): Rule[] {
  return allRules.filter(r => r.category === category)
}

export function getEnabledRules(): Rule[] {
  return allRules.filter(r => r.enabled)
}
