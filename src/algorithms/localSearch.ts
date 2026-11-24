import { type Graph } from '../graphs/adjacencyMatrix'
import { expandGreedily } from './greedy'
import { instrument, type RunOptions } from './types'

export function localSearch(graph: Graph, options: RunOptions = {}) {
  const maxRounds = options.maxRounds ?? graph.size
  if (!Number.isSafeInteger(maxRounds) || maxRounds < 0) {
    throw new Error('O limite da busca local deve ser um inteiro não negativo.')
  }
  const run = instrument(graph, options)
  const vertices = graph.vertices.map((_, i) => i)
  let clique = expandGreedily([], vertices, run)
  if (options.trace) run.record('Clique gulosa inicial', clique)

  function firstImprovement(current: readonly number[]) {
    const members = new Set(current)
    const outsiders = vertices.filter((vertex) => !members.has(vertex))
    for (const removed of current) {
      const kept = current.filter((vertex) => vertex !== removed)
      for (const inserted of outsiders) {
        run.operations.swaps++
        if (!kept.every((vertex) => run.adjacent(vertex, inserted))) continue

        const exchanged = [...kept, inserted]
        const candidates = vertices.filter((candidate) =>
          exchanged.every((member) => run.adjacent(candidate, member)),
        )
        const expanded = expandGreedily(exchanged, candidates, run)
        if (expanded.length <= current.length) continue

        if (options.trace) {
          run.record(`Trocar ${graph.vertices[removed]} por ${graph.vertices[inserted]}`, exchanged)
          for (let i = exchanged.length; i < expanded.length; i++) {
            run.record(`Inserir ${graph.vertices[expanded[i]]} na expansão`, expanded.slice(0, i + 1))
          }
        }
        return expanded
      }
    }
    return null
  }

  if (graph.size === 0) return run.finish('localSearch', clique, 'completed', 'no-improvement')
  while (run.operations.rounds < maxRounds) {
    run.operations.rounds++
    const improved = firstImprovement(clique)
    if (!improved) return run.finish('localSearch', clique, 'completed', 'no-improvement')
    clique = improved
  }
  return run.finish('localSearch', clique, 'completed', 'round-limit')
}
