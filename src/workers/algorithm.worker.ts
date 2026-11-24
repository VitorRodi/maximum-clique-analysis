import { algorithms, type AlgorithmId, type Result, type RunOptions } from '../algorithms'
import { Graph } from '../graphs/adjacencyMatrix'
import { type GraphData } from '../graphs/graphValidation'

export type WorkRequest = { ids: AlgorithmId[]; graph: GraphData; options: RunOptions }
export type WorkResponse = { result: Result } | { error: string }

self.onmessage = ({ data }: MessageEvent<WorkRequest>) => {
  try {
    const graph = Graph.from(data.graph)
    for (const id of data.ids) {
      const response: WorkResponse = { result: algorithms[id](graph, data.options) }
      self.postMessage(response)
    }
  } catch (error) {
    const response: WorkResponse = {
      error: error instanceof Error ? error.message : 'Falha na execução dos algoritmos.',
    }
    self.postMessage(response)
  }
}
