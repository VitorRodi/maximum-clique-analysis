import { type Graph } from '../graphs/adjacencyMatrix'
import { instrument, type Instrument, type RunOptions } from './types'

export function expandGreedily(
  initial: readonly number[],
  candidates: readonly number[],
  run: Instrument,
  onAdd?: (vertex: number, clique: readonly number[]) => void,
) {
  const clique = [...initial]
  let pool = candidates
  while (pool.length > 0) {
    let chosen = pool[0]
    let highestDegree = -1
    for (const vertex of pool) {
      let degree = 0
      for (const other of pool) {
        if (run.adjacent(vertex, other)) degree++
      }
      if (degree > highestDegree) {
        chosen = vertex
        highestDegree = degree
      }
    }
    clique.push(chosen)
    onAdd?.(chosen, clique)
    pool = pool.filter((candidate) => run.adjacent(chosen, candidate))
  }
  return clique
}

export function greedy(graph: Graph, options: RunOptions = {}) {
  const run = instrument(graph, options)
  const clique = expandGreedily(
    [],
    graph.vertices.map((_, index) => index),
    run,
    options.trace
      ? (vertex, current) => run.record(`Selecionar ${graph.vertices[vertex]}`, current)
      : undefined,
  )
  return run.finish('greedy', clique, 'completed', 'finished')
}
