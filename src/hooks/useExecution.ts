import { useEffect, useRef, useState } from 'react'
import { type AlgorithmId, type Result, type RunOptions } from '../algorithms'
import { emptyOperations } from '../algorithms/types'
import { type Graph } from '../graphs/adjacencyMatrix'
import { type WorkRequest, type WorkResponse } from '../workers/algorithm.worker'

type ResultMap = Partial<Record<AlgorithmId, Result>>

export function useExecution() {
  const active = useRef<{ worker: Worker; pending: Set<AlgorithmId> } | null>(null)
  const [results, setResults] = useState<ResultMap>({})
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => active.current?.worker.terminate(), [])

  function stop() {
    const job = active.current
    active.current = null
    job?.worker.terminate()
    setRunning(false)
    return job
  }

  function cancel() {
    const job = stop()
    if (!job) return
    setResults((current) => {
      const next = { ...current }
      for (const id of job.pending) {
        next[id] = {
          algorithm: id,
          status: 'cancelled',
          reason: 'user-cancelled',
          clique: null,
          valid: null,
          certified: false,
          elapsedMs: null,
          operations: emptyOperations(),
          steps: [],
        }
      }
      return next
    })
  }

  function clear() {
    stop()
    setResults({})
    setError('')
  }

  function run(ids: AlgorithmId[], graph: Graph, options: RunOptions) {
    if (active.current) return
    setError('')
    setResults((current) => {
      const next = { ...current }
      for (const id of ids) delete next[id]
      return next
    })
    try {
      const worker = new Worker(new URL('../workers/algorithm.worker.ts', import.meta.url), {
        type: 'module',
      })
      const job = { worker, pending: new Set(ids) }
      active.current = job
      setRunning(true)
      worker.onmessage = ({ data }: MessageEvent<WorkResponse>) => {
        if (active.current !== job) return
        if ('error' in data) {
          stop()
          setError(data.error)
          return
        }
        job.pending.delete(data.result.algorithm)
        setResults((current) => ({ ...current, [data.result.algorithm]: data.result }))
        if (!job.pending.size) stop()
      }
      worker.onerror = () => {
        if (active.current !== job) return
        stop()
        setError('Falha ao carregar o processo de execução. Recarregue a página e tente de novo.')
      }
      const request: WorkRequest = { ids, graph: graph.toData(), options: { ...options, trace: true } }
      worker.postMessage(request)
    } catch (cause) {
      stop()
      setError(cause instanceof Error ? cause.message : 'Não foi possível iniciar a execução.')
    }
  }

  return { results, running, error, run, cancel, clear }
}
