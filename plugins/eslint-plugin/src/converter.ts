import type { Issue } from 'ceviz-core'

export interface ESLintMessage {
  message: string
  line: number
  column: number
  endLine?: number
  endColumn?: number
  severity: 1 | 2
}

export function convertIssueToMessage(issue: Issue): ESLintMessage {
  let message = issue.message

  if (issue.impact.estimate) {
    message += `. Impact: ${issue.impact.estimate}`
  }

  if (issue.suggestion?.fix) {
    message += `. Fix: ${issue.suggestion.fix}`
  }

  return {
    message,
    line: issue.location.line,
    column: issue.location.column,
    endLine: issue.location.endLine,
    endColumn: issue.location.endColumn,
    severity: severityToESLint(issue.severity),
  }
}

function severityToESLint(severity: 'critical' | 'warning' | 'info'): 1 | 2 {
  return severity === 'critical' ? 2 : 1
}
