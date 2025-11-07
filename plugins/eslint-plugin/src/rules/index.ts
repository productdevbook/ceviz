import { arrayFindInLoop } from './array-find-in-loop.js'
import { memoryLeakInterval } from './memory-leak-interval.js'
import { nestedLoops } from './nested-loops.js'
import { sequentialRequests } from './sequential-requests.js'
import { syncFileOperations } from './sync-file-operations.js'

export const rules = {
  'array-find-in-loop': arrayFindInLoop,
  'nested-loops': nestedLoops,
  'memory-leak-interval': memoryLeakInterval,
  'sequential-requests': sequentialRequests,
  'sync-file-operations': syncFileOperations,
}
