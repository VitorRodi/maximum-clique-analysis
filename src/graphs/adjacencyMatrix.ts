import { readGraphData, type Edge, type GraphData } from './graphValidation'

export class Graph {
  readonly vertices: readonly string[]
  readonly edgeCount: number
  readonly #matrix: Uint8Array
  readonly #indices: ReadonlyMap<string, number>

  private constructor(data: GraphData) {
    this.vertices = Object.freeze(data.vertices)
    this.#indices = new Map(data.vertices.map((id, index) => [id, index]))
    this.#matrix = new Uint8Array(this.size * this.size)

    for (const [source, target] of data.edges) {
      const a = this.indexOf(source)
      const b = this.indexOf(target)
      if (a === b) throw new Error('O grafo não admite laços.')
      if (this.hasEdge(a, b)) throw new Error(`Aresta duplicada: ${source}–${target}.`)
      this.#matrix[a * this.size + b] = 1
      this.#matrix[b * this.size + a] = 1
    }
    this.edgeCount = data.edges.length
  }

  static from(value: unknown) {
    return new Graph(readGraphData(value))
  }

  get size() {
    return this.vertices.length
  }

  get density() {
    return this.size < 2 ? 0 : (2 * this.edgeCount) / (this.size * (this.size - 1))
  }

  indexOf(id: string) {
    const index = this.#indices.get(id)
    if (index === undefined) throw new Error(`Vértice inexistente: ${id}.`)
    return index
  }

  hasEdge(a: number, b: number) {
    return (
      Number.isInteger(a) &&
      Number.isInteger(b) &&
      a >= 0 &&
      b >= 0 &&
      a < this.size &&
      b < this.size &&
      this.#matrix[a * this.size + b] === 1
    )
  }

  degree(index: number) {
    if (!Number.isInteger(index) || index < 0 || index >= this.size)
      throw new Error('Índice de vértice inválido.')
    let degree = 0
    for (let other = 0; other < this.size; other++) {
      if (this.hasEdge(index, other)) degree++
    }
    return degree
  }

  isClique(clique: readonly number[]) {
    for (let i = 0; i < clique.length; i++) {
      const vertex = clique[i]
      if (!Number.isInteger(vertex) || vertex < 0 || vertex >= this.size) return false
      for (let j = 0; j < i; j++) {
        if (!this.hasEdge(vertex, clique[j])) return false
      }
    }
    return true
  }

  isMaximalClique(clique: readonly number[]) {
    if (!this.isClique(clique)) return false
    return !this.vertices.some((_, v) => !clique.includes(v) && clique.every((u) => this.hasEdge(u, v)))
  }

  toData(): GraphData {
    const edges: Edge[] = []
    for (let a = 0; a < this.size; a++) {
      for (let b = a + 1; b < this.size; b++) {
        if (this.hasEdge(a, b)) edges.push([this.vertices[a], this.vertices[b]])
      }
    }
    return { vertices: [...this.vertices], edges }
  }

  addVertex(name: string) {
    const data = this.toData()
    data.vertices.push(name.trim())
    return Graph.from(data)
  }

  removeVertex(name: string) {
    this.indexOf(name)
    const { vertices, edges } = this.toData()
    return Graph.from({
      vertices: vertices.filter((vertex) => vertex !== name),
      edges: edges.filter((edge) => !edge.includes(name)),
    })
  }

  addEdge(source: string, target: string) {
    const data = this.toData()
    data.edges.push([source, target])
    return Graph.from(data)
  }

  removeEdge(source: string, target: string) {
    if (!this.hasEdge(this.indexOf(source), this.indexOf(target)))
      throw new Error('A aresta não existe.')
    const { vertices, edges } = this.toData()
    return Graph.from({
      vertices,
      edges: edges.filter((edge) => !(edge.includes(source) && edge.includes(target))),
    })
  }
}
