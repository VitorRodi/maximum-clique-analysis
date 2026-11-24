export const MAX_VERTICES = 200
export type Edge = [string, string]
export type GraphData = { vertices: string[]; edges: Edge[] }

export function readGraphData(value: unknown): GraphData {
  if (typeof value !== 'object' || value === null || !('vertices' in value) || !('edges' in value)) {
    throw new Error('O JSON deve conter as listas vertices e edges.')
  }
  const { vertices, edges } = value
  if (!Array.isArray(vertices) || !Array.isArray(edges)) {
    throw new Error('As propriedades vertices e edges devem ser listas.')
  }
  if (vertices.length > MAX_VERTICES) {
    throw new Error(`O laboratório aceita até ${MAX_VERTICES} vértices.`)
  }
  const names = new Set<string>()
  for (const name of vertices) {
    if (
      typeof name !== 'string' ||
      name !== name.trim() ||
      !name ||
      name.length > 32 ||
      /\p{Cc}/u.test(name)
    ) {
      throw new Error(
        'Use nomes de 1 a 32 caracteres, sem espaços nas pontas ou caracteres de controle.',
      )
    }
    if (names.has(name)) throw new Error(`Vértice duplicado: ${name}.`)
    names.add(name)
  }
  const pairs: Edge[] = []
  for (const pair of edges) {
    if (!Array.isArray(pair) || pair.length !== 2 || !names.has(pair[0]) || !names.has(pair[1])) {
      throw new Error('Cada aresta deve indicar dois vértices existentes.')
    }
    pairs.push([pair[0], pair[1]])
  }
  return { vertices: [...names], edges: pairs }
}
