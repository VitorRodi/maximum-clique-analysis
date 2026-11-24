import { type Graph } from '../graphs/adjacencyMatrix'
import { instrument, type RunOptions } from './types'

export const DEFAULT_EXACT_LIMIT = 20
export const MAX_EXACT_LIMIT = 24
export const DEFAULT_TIME_LIMIT_MS = 5_000

export function bruteForce(graph: Graph, options: RunOptions = {}) {
  const maxVertices = options.maxVertices ?? DEFAULT_EXACT_LIMIT
  const maxMilliseconds = options.maxMilliseconds ?? DEFAULT_TIME_LIMIT_MS
  if (!Number.isInteger(maxVertices) || maxVertices < 0 || maxVertices > MAX_EXACT_LIMIT) {
    throw new Error(`O limite exato deve ser um inteiro de 0 a ${MAX_EXACT_LIMIT}.`)
  }
  if (!Number.isFinite(maxMilliseconds) || maxMilliseconds < 0) {
    throw new Error('O limite de tempo deve ser finito e não negativo.')
  }

  const run = instrument(graph, options)
  if (graph.size > maxVertices) return run.finish('bruteForce', null, 'skipped', 'vertex-limit')

  const subset: number[] = []
  let largest: number[] = []
  let timedOut = false

  function isClique() {
    for (let i = 1; i < subset.length; i++) {
      for (let j = 0; j < i; j++) {
        if (!run.adjacent(subset[i], subset[j])) return false
      }
    }
    return true
  }

  function enumerate(vertex: number) {
    if (timedOut) return
    if (vertex === graph.size) {
      if (run.operations.subsets % 1024 === 0 && run.elapsed() >= maxMilliseconds) {
        timedOut = true
        return
      }
      run.operations.subsets++
      if (isClique() && subset.length > largest.length) {
        largest = [...subset]
        if (options.trace) run.record('Nova maior clique encontrada', largest)
      }
      return
    }
    subset.push(vertex)
    enumerate(vertex + 1)
    subset.pop()
    enumerate(vertex + 1)
  }

  if (options.trace) run.record('Início da enumeração', largest)
  enumerate(0)
  return timedOut
    ? run.finish('bruteForce', largest, 'interrupted', 'time-limit')
    : run.finish('bruteForce', largest, 'completed', 'finished')
}
