import { Graph } from './adjacencyMatrix'
import { MAX_VERTICES, type Edge } from './graphValidation'

export function generateGraph(n: number, density: number, seed: number) {
  if (!Number.isInteger(n) || n < 0 || n > MAX_VERTICES) {
    throw new Error(`Informe de 0 a ${MAX_VERTICES} vértices inteiros.`)
  }
  if (!Number.isFinite(density) || density < 0 || density > 1) {
    throw new Error('A densidade precisa estar entre 0% e 100%.')
  }
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new Error('A semente deve ser um inteiro entre 0 e 4.294.967.295.')
  }

  // Mulberry32. Toda a aritmética da semente é reduzida a 32 bits.
  let state = seed
  function random() {
    state = (state + 0x6d2b79f5) >>> 0
    let value = Math.imul(state ^ (state >>> 15), state | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 0x100000000
  }

  const vertices = Array.from({ length: n }, (_, i) => `v${i + 1}`)
  const edges: Edge[] = []
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      if (random() < density) edges.push([vertices[a], vertices[b]])
    }
  }
  return Graph.from({ vertices, edges })
}
