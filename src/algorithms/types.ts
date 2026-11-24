import { type Graph } from '../graphs/adjacencyMatrix'

export const algorithmNames = {
  bruteForce: 'Força bruta',
  greedy: 'Guloso',
  localSearch: 'Busca local',
} as const

export type AlgorithmId = keyof typeof algorithmNames
export const algorithmIds: AlgorithmId[] = ['bruteForce', 'greedy', 'localSearch']
export type RunStatus = 'completed' | 'skipped' | 'interrupted' | 'cancelled'
export type StopReason =
  'finished' | 'vertex-limit' | 'time-limit' | 'no-improvement' | 'round-limit' | 'user-cancelled'

export type Operations = {
  adjacencyChecks: number
  subsets: number
  swaps: number
  rounds: number
}

export type Step = {
  label: string
  clique: string[]
}

export type RunOptions = {
  trace?: boolean
  maxVertices?: number
  maxMilliseconds?: number
  maxRounds?: number
}

export type Result = {
  algorithm: AlgorithmId
  status: RunStatus
  reason: StopReason
  clique: string[] | null
  valid: boolean | null
  certified: boolean
  elapsedMs: number | null
  operations: Operations
  steps: Step[]
}

export function emptyOperations(): Operations {
  return { adjacencyChecks: 0, subsets: 0, swaps: 0, rounds: 0 }
}

export function instrument(graph: Graph, options: RunOptions) {
  const start = performance.now()
  const operations = emptyOperations()
  const steps: Step[] = []
  return {
    operations,
    adjacent(a: number, b: number) {
      operations.adjacencyChecks++
      return graph.hasEdge(a, b)
    },
    record(label: string, clique: readonly number[]) {
      if (options.trace) steps.push({ label, clique: clique.map((v) => graph.vertices[v]) })
    },
    elapsed: () => performance.now() - start,
    finish(
      algorithm: AlgorithmId,
      clique: readonly number[] | null,
      status: RunStatus,
      reason: StopReason,
    ): Result {
      const elapsedMs = performance.now() - start
      return {
        algorithm,
        status,
        reason,
        operations,
        steps,
        elapsedMs,
        clique: clique?.map((v) => graph.vertices[v]) ?? null,
        valid: clique === null ? null : graph.isClique(clique),
        certified: algorithm === 'bruteForce' && status === 'completed',
      }
    },
  }
}

export type Instrument = ReturnType<typeof instrument>
