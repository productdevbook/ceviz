export interface Issue {
  id: string
  rule: string
  severity: 'critical' | 'warning' | 'info'
  category: 'cpu' | 'memory' | 'io' | 'bundle' | 'framework'
  location: Location
  message: string
  description: string
  impact: Impact
  suggestion?: Suggestion
  autoFixable: boolean
  codeSnippet?: CodeSnippet
}

export interface Location {
  file: string
  line: number
  column: number
  endLine?: number
  endColumn?: number
}

export interface Impact {
  type: 'cpu' | 'memory' | 'io' | 'bundle'
  level: 'extreme' | 'high' | 'medium' | 'low'
  complexity?: string // "O(n²)", "O(2^n)", etc.
  estimate?: string // "100ms → 10s for 1000 items"
  blocking?: boolean
}

export interface Suggestion {
  fix: string
  example?: string
  alternatives?: Record<string, string>
  docs?: string
}

export interface CodeSnippet {
  before: string
  after?: string
  context: string[]
}

export interface AnalysisResult {
  summary: Summary
  issues: Issue[]
  metrics: Metrics
  files: FileAnalysis[]
  timestamp: string
  duration: number
}

export interface Summary {
  totalFiles: number
  analyzedFiles: number
  totalIssues: number
  critical: number
  warnings: number
  info: number
  score: number // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface Metrics {
  cpu: {
    worstComplexity: string
    averageComplexity: string
    hotspots: Location[]
  }
  memory: {
    estimatedBaseline: string
    leaks: number
    bloatLevel: 'low' | 'medium' | 'high'
  }
  bundle: {
    size: number
    potentialSavings: number
    heavyDeps: string[]
  }
  io: {
    blockingOps: number
    waterfalls: number
  }
}

export interface FileAnalysis {
  path: string
  size: number
  lines: number
  complexity: string
  issues: Issue[]
}

export interface Rule {
  id: string
  name: string
  category: 'cpu' | 'memory' | 'io' | 'bundle' | 'framework'
  severity: 'critical' | 'warning' | 'info'
  description: string
  enabled: boolean
  check: (context: RuleContext) => Issue[]
}

export interface RuleContext {
  ast: any
  code: string
  filePath: string
  fileContent: string
  projectRoot: string
  isNuxt: boolean
  isVue: boolean
  isTS: boolean
}

export interface ProjectContext {
  root: string
  packageJson: any
  isNuxt: boolean
  isVite: boolean
  framework?: string
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}
