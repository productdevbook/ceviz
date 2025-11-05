/**
 * Convert OXC byte offset to line and column numbers
 * OXC AST uses 'span' with byte offsets, not line/column
 */
export function getLineAndColumn(code: string, byteOffset: number): { line: number, column: number } {
  if (byteOffset === 0 || !code) {
    return { line: 1, column: 0 }
  }

  const beforeCode = code.substring(0, byteOffset)
  const lines = beforeCode.split('\n')
  const line = lines.length
  const column = lines[lines.length - 1]?.length || 0

  return { line, column }
}

/**
 * Get location from OXC AST node
 */
export function getNodeLocation(node: any, code: string): { line: number, column: number } {
  if (!node?.span) {
    // Try alternative location properties
    if (node?.start !== undefined) {
      return getLineAndColumn(code, node.start)
    }
    if (node?.loc?.start?.offset !== undefined) {
      return getLineAndColumn(code, node.loc.start.offset)
    }
    return { line: 1, column: 0 }
  }

  return getLineAndColumn(code, node.span.start)
}
