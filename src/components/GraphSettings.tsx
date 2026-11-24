import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Graph } from '../graphs/adjacencyMatrix'
import { generateGraph } from '../graphs/graphGenerator'
import { MAX_VERTICES } from '../graphs/graphValidation'
import { presets } from '../graphs/predefinedGraphs'

export type Instance = { graph: Graph; name: string; preset: keyof typeof presets | '' }

export function GraphSettings({
  instance,
  replace,
  disabled,
}: {
  instance: Instance
  replace: (instance: Instance) => void
  disabled: boolean
}) {
  const { graph, preset } = instance
  const [n, setN] = useState('20')
  const [density, setDensity] = useState('50')
  const [seed, setSeed] = useState('42')
  const [vertexName, setVertexName] = useState('')
  const [source, setSource] = useState('')
  const [target, setTarget] = useState('')
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const a = graph.vertices.includes(source) ? source : (graph.vertices[0] ?? '')
  const b = graph.vertices.includes(target) ? target : (graph.vertices.find((v) => v !== a) ?? '')
  const canConnect = a !== '' && b !== '' && a !== b
  const hasEdge = canConnect && graph.hasEdge(graph.indexOf(a), graph.indexOf(b))

  function update(action: () => Instance) {
    try {
      replace(action())
      setError('')
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível alterar o grafo.')
      return false
    }
  }

  function generate(event: FormEvent) {
    event.preventDefault()
    update(() => ({
      graph: generateGraph(Number(n), Number(density) / 100, Number(seed)),
      name: `Grafo aleatório · semente ${seed}`,
      preset: '',
    }))
  }

  function edit(action: () => Graph) {
    return update(() => ({ graph: action(), name: 'Grafo editado', preset: '' }))
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    setImporting(true)
    try {
      if (file.size > 2_000_000) throw new Error('Selecione um JSON de até 2 MB.')
      const text = await file.text()
      update(() => ({ graph: Graph.from(JSON.parse(text)), name: 'Grafo importado', preset: '' }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível ler o arquivo.')
    } finally {
      setImporting(false)
    }
  }

  function exportFile() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(graph.toData(), null, 2)], { type: 'application/json' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = 'maxclique-grafo.json'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
  }

  return (
    <aside className="panel controls" aria-labelledby="instance-title">
      <h2 id="instance-title">Configurar instância</h2>
      <fieldset disabled={disabled || importing}>
        <div className="control-section">
          <label htmlFor="preset">Grafos predefinidos</label>
          <select
            id="preset"
            value={preset}
            onChange={(event) => {
              const key = event.target.value as keyof typeof presets
              if (key)
                update(() => ({ graph: presets[key].create(), name: presets[key].name, preset: key }))
            }}
          >
            <option value="" disabled>
              Instância personalizada
            </option>
            {Object.entries(presets).map(([key, item]) => (
              <option key={key} value={key}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <form className="control-section" onSubmit={generate}>
          <h3>Grafo aleatório</h3>
          <div className="grid grid-cols-2 gap-3">
            <label>
              Vértices
              <input
                type="number"
                min="0"
                max={MAX_VERTICES}
                required
                value={n}
                onChange={(e) => setN(e.target.value)}
              />
            </label>
            <label>
              Densidade (%)
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                required
                value={density}
                onChange={(e) => setDensity(e.target.value)}
              />
            </label>
          </div>
          <label>
            Semente
            <input
              type="number"
              min="0"
              max="4294967295"
              step="1"
              required
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
          </label>
          <button type="submit" className="button stretch">
            Gerar grafo
          </button>
        </form>
        <details className="control-section">
          <summary>Editar vértices e arestas</summary>
          <form
            className="edit-form"
            onSubmit={(event) => {
              event.preventDefault()
              if (edit(() => graph.addVertex(vertexName))) setVertexName('')
            }}
          >
            <label>
              Novo vértice
              <input
                required
                value={vertexName}
                maxLength={32}
                onChange={(e) => setVertexName(e.target.value)}
              />
            </label>
            <button className="button stretch" type="submit">
              Adicionar vértice
            </button>
          </form>
          <div className="edit-form">
            <label>
              Vértice de origem
              <select value={a} onChange={(e) => setSource(e.target.value)} disabled={!graph.size}>
                {!graph.size && <option value="">Nenhum vértice</option>}
                {graph.vertices.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Vértice de destino
              <select value={b} onChange={(e) => setTarget(e.target.value)} disabled={!graph.size}>
                {!graph.size && <option value="">Nenhum vértice</option>}
                {graph.vertices.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="button stretch"
              disabled={!canConnect}
              onClick={() => edit(() => (hasEdge ? graph.removeEdge(a, b) : graph.addEdge(a, b)))}
            >
              {hasEdge ? 'Remover aresta' : 'Adicionar aresta'}
            </button>
            <button
              type="button"
              className="button stretch danger"
              disabled={!a}
              onClick={() => edit(() => graph.removeVertex(a))}
            >
              Remover vértice de origem
            </button>
          </div>
        </details>
        <div className="control-section json-actions">
          <label className="button upload">
            {importing ? 'Lendo JSON…' : 'Importar JSON'}
            <input
              type="file"
              accept=".json,application/json"
              aria-label="Importar JSON"
              onChange={importFile}
            />
          </label>
          <button className="button" type="button" onClick={exportFile}>
            Exportar JSON
          </button>
        </div>
      </fieldset>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </aside>
  )
}
