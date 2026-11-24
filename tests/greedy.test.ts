import { expect, it } from 'vitest'
import { greedy } from '../src/algorithms/greedy'
import { Graph } from '../src/graphs/adjacencyMatrix'
import { presets } from '../src/graphs/predefinedGraphs'

it('escolhe X, A e B no exemplo, recalculando graus dentro de P', () => {
  const graph = presets.tpe.create()
  const result = greedy(graph, { trace: true })
  expect(result.clique).toEqual(['X', 'A', 'B'])
  expect(result.steps.map((step) => step.clique)).toEqual([['X'], ['X', 'A'], ['X', 'A', 'B']])
  expect(result.valid).toBe(true)
  expect(result.certified).toBe(false)
  expect(graph.isMaximalClique([4, 0, 1])).toBe(true)
})

it('desempata pela ordem de V mesmo com nomes fora da ordem alfabética', () => {
  const data = {
    vertices: ['Z', 'A', 'B', 'C'],
    edges: [
      ['Z', 'B'],
      ['A', 'C'],
    ],
  }
  expect(greedy(Graph.from(data)).clique).toEqual(['Z', 'B'])
})
