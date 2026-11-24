import { Graph } from './adjacencyMatrix'
import { generateGraph } from './graphGenerator'

export const presets = {
  tpe: {
    name: 'Exemplo do TPE',
    create: () =>
      Graph.from({
        vertices: ['A', 'B', 'C', 'D', 'X', 'E', 'F', 'G', 'H'],
        edges: [
          ['A', 'B'],
          ['A', 'C'],
          ['A', 'D'],
          ['B', 'C'],
          ['B', 'D'],
          ['C', 'D'],
          ['X', 'A'],
          ['X', 'B'],
          ['X', 'E'],
          ['X', 'F'],
          ['X', 'G'],
          ['X', 'H'],
        ],
      }),
  },
  complete: { name: 'Grafo completo K₆', create: () => generateGraph(6, 1, 0) },
  independent: { name: 'Cinco vértices isolados', create: () => generateGraph(5, 0, 0) },
  bipartite: {
    name: 'Bipartido completo K₃,₃',
    create: () =>
      Graph.from({
        vertices: ['A', 'B', 'C', 'D', 'E', 'F'],
        edges: ['A', 'B', 'C'].flatMap((a) => ['D', 'E', 'F'].map((b) => [a, b])),
      }),
  },
  empty: { name: 'Grafo vazio', create: () => generateGraph(0, 0, 0) },
} as const
