import cytoscape, { type Core, type Position } from 'cytoscape'
import { useEffect, useRef, useState } from 'react'
import { type Graph } from '../graphs/adjacencyMatrix'

const tpePositions: Record<string, Position> = {
  E: { x: 0, y: 46 },
  F: { x: 80, y: 12 },
  G: { x: 160, y: 12 },
  H: { x: 240, y: 46 },
  X: { x: 120, y: 85 },
  A: { x: 80, y: 158 },
  B: { x: 160, y: 158 },
  C: { x: 80, y: 234 },
  D: { x: 160, y: 234 },
}
const noHighlights: readonly string[] = []

export function GraphView({
  graph,
  tpe,
  highlight = noHighlights,
}: {
  graph: Graph
  tpe: boolean
  highlight?: readonly string[]
}) {
  const container = useRef<HTMLDivElement>(null)
  const canvas = useRef<Core>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const vertex = selected !== null && graph.vertices.includes(selected) ? selected : null

  useEffect(() => {
    if (!container.current) return
    const host = container.current
    const data = graph.toData()
    const large = graph.size > 45
    const vertexId = (name: string) => `v:${name}`
    const elements = [
      ...data.vertices.map((name) => ({
        data: { id: vertexId(name), name },
        position: tpe ? tpePositions[name] : undefined,
      })),
      ...data.edges.map(([a, b], i) => ({
        data: { id: `e:${i}`, source: vertexId(a), target: vertexId(b) },
      })),
    ]
    const cy = cytoscape({
      container: host,
      elements,
      layout: tpe ? { name: 'preset', fit: false } : { name: 'circle', fit: false, padding: 60 },
      selectionType: 'single',
      boxSelectionEnabled: false,
      minZoom: 0.05,
      maxZoom: 3,
      style: [
        {
          selector: 'node',
          style: {
            label: large ? '' : 'data(name)',
            width: large ? 16 : 34,
            height: large ? 16 : 34,
            'background-color': '#ffffff',
            'border-color': '#42647c',
            'border-width': 1.7,
            color: '#142f45',
            'font-size': 13,
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-max-width': '48px',
            'text-wrap': 'ellipsis',
          },
        },
        {
          selector: 'edge',
          style: {
            width: large ? 0.75 : 1.6,
            'line-color': '#97a7b1',
            opacity: large ? 0.25 : 0.8,
            'curve-style': 'straight',
          },
        },
        {
          selector: 'node.clique',
          style: {
            label: 'data(name)',
            'background-color': '#146446',
            'border-color': '#146446',
            color: '#ffffff',
            width: large ? 22 : 34,
            height: large ? 22 : 34,
            'font-size': large ? 8 : 13,
          },
        },
        {
          selector: 'edge.clique',
          style: { 'line-color': '#197a54', opacity: 1, width: large ? 1.4 : 3 },
        },
        { selector: 'node:selected', style: { 'border-width': 3, 'border-color': '#234e89' } },
      ],
    })
    canvas.current = cy
    cy.on('tap', 'node', (event) => setSelected(event.target.data('name') as string))
    cy.on('tap', (event) => {
      if (event.target === cy) setSelected(null)
    })
    const fit = () => {
      if (!host.clientWidth || !host.clientHeight) return
      cy.resize()
      if (graph.size) cy.fit(undefined, tpe ? 32 : 38)
    }
    const observer = new ResizeObserver(fit)
    observer.observe(host)
    fit()
    return () => {
      observer.disconnect()
      cy.destroy()
      canvas.current = null
    }
  }, [graph, tpe])

  useEffect(() => {
    const cy = canvas.current
    if (!cy) return
    const names = new Set(highlight)
    cy.batch(() => {
      cy.nodes().forEach((node) => {
        node.toggleClass('clique', names.has(node.data('name')))
      })
      cy.edges().forEach((edge) => {
        edge.toggleClass(
          'clique',
          names.has(edge.source().data('name')) && names.has(edge.target().data('name')),
        )
      })
    })
  }, [graph, highlight, tpe])

  function changeZoom(factor: number) {
    const cy = canvas.current
    if (!cy) return
    cy.zoom({
      level: cy.zoom() * factor,
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
    })
  }

  return (
    <div className="graph-view">
      <div className="graph-stage">
        <div
          className="graph-canvas"
          ref={container}
          role="img"
          aria-label={`Grafo com ${graph.size} vértices e ${graph.edgeCount} arestas. ${highlight.length ? `Clique em destaque: ${highlight.join(', ')}.` : ''}`}
        />
        {!graph.size && (
          <div className="graph-empty">Grafo vazio. Adicione um vértice para começar.</div>
        )}
        <div className="zoom-controls" aria-label="Controles de visualização">
          <button
            type="button"
            onClick={() => changeZoom(1.25)}
            disabled={!graph.size}
            aria-label="Ampliar grafo"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => changeZoom(0.8)}
            disabled={!graph.size}
            aria-label="Reduzir grafo"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => canvas.current?.fit(undefined, 38)}
            disabled={!graph.size}
          >
            Ajustar
          </button>
        </div>
      </div>
      <div className="graph-footer">
        <span>
          <i className="legend-node" /> Vértices
        </span>
        <span>
          <i className="legend-node is-clique" /> Clique em destaque
        </span>
        <span className="vertex-status">
          {vertex
            ? `${vertex} · grau ${graph.degree(graph.indexOf(vertex))}`
            : 'Selecione um vértice para ver o grau'}
        </span>
      </div>
      <details className="accessible-data">
        <summary>Vértices e graus</summary>
        <p>
          {graph.vertices.map((name, i) => `${name} (${graph.degree(i)})`).join(', ') ||
            'Nenhum vértice.'}
        </p>
      </details>
    </div>
  )
}
