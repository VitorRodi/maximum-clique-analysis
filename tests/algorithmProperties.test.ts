import { expect, it } from 'vitest'
import { bruteForce, greedy, localSearch } from '../src/algorithms'
import { Graph } from '../src/graphs/adjacencyMatrix'
import { generateGraph } from '../src/graphs/graphGenerator'
import { type Edge, type GraphData } from '../src/graphs/graphValidation'
import { presets } from '../src/graphs/predefinedGraphs'

function pairs<T>(vertices: readonly T[]): [T, T][] {
  return vertices.flatMap((a, i) => vertices.slice(i + 1).map((b): [T, T] => [a, b]))
}

function independentAdjacency(data: GraphData) {
  const neighbors = new Map(data.vertices.map((v) => [v, new Set<string>()]))
  for (const [a, b] of data.edges) {
    neighbors.get(a)?.add(b)
    neighbors.get(b)?.add(a)
  }
  return (a: string, b: string) => neighbors.get(a)?.has(b) ?? false
}

// Oráculo Bron–Kerbosch sem pivô, só no teste. Enumera cliques maximais via conjuntos.
function oracle(data: GraphData) {
  const adjacent = independentAdjacency(data)
  let best = 0
  function visit(size: number, candidates: Set<string>, excluded: Set<string>) {
    if (!candidates.size && !excluded.size) best = Math.max(best, size)
    for (const vertex of candidates) {
      visit(
        size + 1,
        new Set([...candidates].filter((other) => adjacent(vertex, other))),
        new Set([...excluded].filter((other) => adjacent(vertex, other))),
      )
      candidates.delete(vertex)
      excluded.add(vertex)
    }
  }
  visit(0, new Set(data.vertices), new Set())
  return best
}

function check(graph: Graph, expected: number) {
  const data = graph.toData()
  const edge = independentAdjacency(data)
  const [exact, heuristic, local] = [bruteForce(graph), greedy(graph), localSearch(graph)]
  expect(exact.certified).toBe(true)
  expect(exact.clique).toHaveLength(expected)
  for (const result of [exact, heuristic, local]) {
    const found = result.clique!
    expect(new Set(found).size).toBe(found.length)
    expect(found.every((vertex) => data.vertices.includes(vertex))).toBe(true)
    expect(pairs(found).every(([a, b]) => edge(a, b))).toBe(true)
    expect(found.length).toBeLessThanOrEqual(expected)
  }
  for (const found of [heuristic.clique!, local.clique!]) {
    expect(data.vertices.some((v) => !found.includes(v) && found.every((u) => edge(v, u)))).toBe(false)
  }
  expect(local.clique!.length).toBeGreaterThanOrEqual(heuristic.clique!.length)
}

const standard = [
  ['vazio', presets.empty.create(), 0],
  ['unitário', generateGraph(1, 0, 0), 1],
  ['completo', presets.complete.create(), 6],
  ['sem arestas', presets.independent.create(), 1],
  ['K₃,₃', presets.bipartite.create(), 2],
  ['TPE', presets.tpe.create(), 4],
] as const

it.each(standard)('verifica a família %s', (_, graph, expected) => check(graph, expected))

it.each([
  [
    'desconectado',
    [
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'C'],
      ['D', 'E'],
    ],
    3,
  ],
  [
    'estrela',
    [
      ['A', 'B'],
      ['A', 'C'],
      ['A', 'D'],
      ['A', 'E'],
    ],
    2,
  ],
  [
    'caminho',
    [
      ['A', 'B'],
      ['B', 'C'],
      ['C', 'D'],
      ['D', 'E'],
    ],
    2,
  ],
  [
    'ciclo',
    [
      ['A', 'B'],
      ['B', 'C'],
      ['C', 'D'],
      ['D', 'E'],
      ['E', 'A'],
    ],
    2,
  ],
] satisfies [string, Edge[], number][])('verifica o grafo %s', (_, edges, expected) =>
  check(Graph.from({ vertices: ['A', 'B', 'C', 'D', 'E'], edges }), expected),
)

it('compara as três soluções com o oráculo em todos os 1.100 grafos rotulados com até 5 vértices', () => {
  let count = 0
  for (let n = 0; n <= 5; n++) {
    const vertices = Array.from({ length: n }, (_, index) => String(index))
    const possible = pairs(vertices)
    for (let mask = 0; mask < 2 ** possible.length; mask++) {
      const data = { vertices, edges: possible.filter((_, index) => (mask & (1 << index)) !== 0) }
      check(Graph.from(data), oracle(data))
      count++
    }
  }
  expect(count).toBe(1100)
})

it.each([0.2, 0.5, 0.8])('valida grafos de 12 vértices com densidade nominal %s', (density) => {
  for (const seed of [11, 23, 37, 53, 71]) {
    const graph = generateGraph(12, density, seed)
    check(graph, oracle(graph.toData()))
  }
})

it('ignora índices fracionários que por acaso produziriam um deslocamento inteiro', () => {
  const graph = Graph.from({ vertices: ['A', 'B'], edges: [['A', 'B']] })
  expect(graph.hasEdge(0.5, 0)).toBe(false)
})
