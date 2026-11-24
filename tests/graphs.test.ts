import { describe, expect, it } from 'vitest'
import { Graph } from '../src/graphs/adjacencyMatrix'
import { generateGraph } from '../src/graphs/graphGenerator'
import { presets } from '../src/graphs/predefinedGraphs'

describe('matriz de adjacência', () => {
  it('mantém simetria, diagonal vazia, graus e densidade', () => {
    const graph = Graph.from({
      vertices: ['A', 'B', 'C'],
      edges: [
        ['A', 'B'],
        ['B', 'C'],
      ],
    })
    expect(graph.hasEdge(0, 1)).toBe(true)
    expect(graph.hasEdge(1, 0)).toBe(true)
    expect(graph.hasEdge(1, 1)).toBe(false)
    expect(graph.degree(1)).toBe(2)
    expect(graph.density).toBeCloseTo(2 / 3)
    expect(Graph.from({ vertices: [], edges: [] }).density).toBe(0)
  })

  it.each([
    null,
    {},
    { vertices: ['A', 'A'], edges: [] },
    { vertices: ['A', ' '], edges: [] },
    { vertices: ['A'], edges: [['A', 'A']] },
    {
      vertices: ['A', 'B'],
      edges: [
        ['A', 'B'],
        ['B', 'A'],
      ],
    },
    { vertices: ['A'], edges: [['A', 'Z']] },
    { vertices: ['A', 'B'], edges: [['A', 'B', 'C']] },
  ])('rejeita grafo inválido %#', (data) => {
    expect(() => Graph.from(data)).toThrow()
  })

  it('edita vértices e arestas sem alterar a instância anterior', () => {
    const start = Graph.from({ vertices: ['A'], edges: [] })
    const edited = start.addVertex(' B ').addEdge('B', 'A')
    expect(start.toData()).toEqual({ vertices: ['A'], edges: [] })
    expect(edited.toData()).toEqual({ vertices: ['A', 'B'], edges: [['A', 'B']] })
    expect(edited.removeEdge('A', 'B').edgeCount).toBe(0)
    expect(edited.removeVertex('A').toData()).toEqual({ vertices: ['B'], edges: [] })
    expect(() => edited.addEdge('A', 'B')).toThrow()
    expect(() => edited.removeEdge('A', 'X')).toThrow()
    expect(Graph.from(JSON.parse(JSON.stringify(edited.toData()))).toData()).toEqual(edited.toData())
  })

  it('distingue uma clique maximal de um conjunto inválido ou expansível', () => {
    const graph = Graph.from({ vertices: ['A', 'B', 'C'], edges: [['A', 'B']] })
    expect(graph.isClique([0, 2])).toBe(false)
    expect(graph.isClique([0, 0])).toBe(false)
    expect(graph.isClique([3])).toBe(false)
    expect(graph.isMaximalClique([0])).toBe(false)
    expect(graph.isMaximalClique([2])).toBe(true)
    expect(graph.isMaximalClique([0, 1])).toBe(true)
  })
})

describe('instâncias', () => {
  it('reproduz a matriz com a mesma semente e varia com outra semente', () => {
    expect(generateGraph(10, 0.5, 42).toData()).toEqual(generateGraph(10, 0.5, 42).toData())
    expect(generateGraph(10, 0.5, 43).toData()).not.toEqual(generateGraph(10, 0.5, 42).toData())
    expect(generateGraph(10, 0, 42).edgeCount).toBe(0)
    expect(generateGraph(10, 1, 42).edgeCount).toBe(45)
  })

  it.each([
    [2.5, 0.5, 1],
    [201, 0.5, 1],
    [5, NaN, 1],
    [5, -0.1, 1],
    [5, 1, -1],
    [5, 1, 0.1],
  ])('rejeita parâmetros inválidos (%s, %s, %s)', (n, density, seed) => {
    expect(() => generateGraph(n, density, seed)).toThrow()
  })

  it('preserva os nove vértices e doze arestas exatas do TPE', () => {
    const graph = presets.tpe.create()
    const data = graph.toData()
    expect(data.vertices).toEqual(['A', 'B', 'C', 'D', 'X', 'E', 'F', 'G', 'H'])
    expect(data.edges.map((edge) => edge.join('-'))).toEqual([
      'A-B',
      'A-C',
      'A-D',
      'A-X',
      'B-C',
      'B-D',
      'B-X',
      'C-D',
      'X-E',
      'X-F',
      'X-G',
      'X-H',
    ])
    expect(graph.degree(4)).toBe(6)
  })
})
