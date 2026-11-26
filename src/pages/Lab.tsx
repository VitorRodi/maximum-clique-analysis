import { lazy, Suspense, useState } from 'react'
import { algorithmIds, algorithmNames, type AlgorithmId } from '../algorithms'
import { DEFAULT_EXACT_LIMIT, DEFAULT_TIME_LIMIT_MS, MAX_EXACT_LIMIT } from '../algorithms/bruteForce'
import { GraphSettings, type Instance } from '../components/GraphSettings'

import { ResultsTable } from '../components/ResultsTable'
import { presets } from '../graphs/predefinedGraphs'
import { useExecution } from '../hooks/useExecution'
import { formatPercent } from '../utils/format'

const GraphView = lazy(() =>
  import('../components/GraphView').then((module) => ({ default: module.GraphView })),
)

export function Lab() {
  const [instance, setInstance] = useState<Instance>(() => ({
    graph: presets.tpe.create(),
    name: presets.tpe.name,
    preset: 'tpe',
  }))
  const [focus, setFocus] = useState<AlgorithmId | null>(null)
  const [step, setStep] = useState<number | null>(null)
  const [exactLimit, setExactLimit] = useState(String(DEFAULT_EXACT_LIMIT))
  const [time, setTime] = useState(String(DEFAULT_TIME_LIMIT_MS / 1_000))
  const [rounds, setRounds] = useState('')
  const [notice, setNotice] = useState('')
  const [runFromGraph, setRunFromGraph] = useState(true)
  const { results, running, error, run, cancel, clear } = useExecution()
  const { graph, preset, name } = instance
  const focused = focus === null ? undefined : results[focus]
  const selectedStep = step === null ? undefined : focused?.steps[step]
  const highlight = selectedStep?.clique ?? focused?.clique ?? undefined
  const hasResults = Object.keys(results).length > 0
  const optimum = results.bruteForce?.certified ? (results.bruteForce.clique?.length ?? null) : null

  function choose(id: AlgorithmId | null) {
    setFocus(id)
    setStep(null)
  }

  function execute(ids: AlgorithmId[]) {
    setRunFromGraph(ids.length > 1)
    const vertices = Number(exactLimit)
    const seconds = Number(time)
    const maxRounds = rounds === '' ? undefined : Number(rounds)
    if (
      ids.includes('bruteForce') &&
      (exactLimit === '' ||
        !Number.isInteger(vertices) ||
        vertices < 0 ||
        vertices > MAX_EXACT_LIMIT ||
        time === '' ||
        !Number.isFinite(seconds) ||
        seconds < 0.1 ||
        seconds > 30)
    ) {
      setNotice(`Informe um limite de 0 a ${MAX_EXACT_LIMIT} vértices inteiros e de 0,1 a 30 segundos.`)
      return
    }
    if (
      ids.includes('localSearch') &&
      maxRounds !== undefined &&
      (!Number.isInteger(maxRounds) || maxRounds < 0 || maxRounds > 200)
    ) {
      setNotice('Informe de 0 a 200 rodadas inteiras ou deixe o campo vazio.')
      return
    }
    setNotice('')
    choose(ids.length === 1 ? ids[0] : graph.size > vertices ? 'greedy' : 'bruteForce')
    run(ids, graph, { maxVertices: vertices, maxMilliseconds: seconds * 1000, maxRounds })
  }

  const runFeedback = (
    <>
      {(notice || error) && (
        <p className="error" role="alert">
          {notice || error}
        </p>
      )}
      <p className={running ? 'execution-status' : 'sr-only'} role="status">
        {running ? 'Executando em segundo plano…' : hasResults ? 'Resultados atualizados.' : ''}
      </p>
    </>
  )

  return (
    <div className="lab-shell">
      <div className="page-heading">
        <h1>Laboratório de grafos</h1>
      </div>
      <section className="panel graph-panel" aria-labelledby="graph-name">
        <div className="panel-header">
          <div className="graph-heading">
            <h2 id="graph-name">{name}</h2>
            <dl className="graph-metrics">
              <div>
                <dt>Vértices</dt>
                <dd>{graph.size}</dd>
              </div>
              <div>
                <dt>Arestas</dt>
                <dd>{graph.edgeCount}</dd>
              </div>
              <div>
                <dt>Densidade</dt>
                <dd>{formatPercent(100 * graph.density)}</dd>
              </div>
            </dl>
          </div>
          <div className="graph-run-actions">
            <button
              className="button primary"
              type="button"
              disabled={running}
              onClick={() => execute(algorithmIds)}
            >
              Executar todos
            </button>
            {running && runFromGraph && (
              <button className="button danger" type="button" onClick={cancel}>
                Cancelar execução
              </button>
            )}
          </div>
        </div>
        <Suspense
          fallback={
            <p className="graph-stage grid place-items-center" role="status">
              Carregando grafo…
            </p>
          }
        >
          <GraphView graph={graph} tpe={preset === 'tpe'} highlight={highlight} />
        </Suspense>
        {hasResults && (
          <div className="quick-results" role="group" aria-label="Tamanho das cliques">
            {algorithmIds.map((id) => {
              const result = results[id]
              const count = result?.clique?.length
              const state =
                result?.status === 'interrupted'
                  ? 'Clique parcial'
                  : result?.status === 'skipped'
                    ? 'Limite de vértices'
                    : result?.status === 'cancelled'
                      ? 'Cancelada'
                      : result
                        ? ''
                        : 'Aguardando execução'
              const cardinality =
                count === undefined ? '' : `${count} ${count === 1 ? 'vértice' : 'vértices'}`
              return (
                <button
                  className="quick-result"
                  key={id}
                  type="button"
                  disabled={count === undefined}
                  aria-pressed={focus === id && count !== undefined}
                  aria-label={[algorithmNames[id], cardinality, state.toLowerCase()]
                    .filter(Boolean)
                    .join(', ')}
                  onClick={() => choose(id)}
                >
                  <span>
                    {algorithmNames[id]}
                    {state && <small>{state}</small>}
                  </span>
                  <strong>{count ?? '—'}</strong>
                </button>
              )
            })}
          </div>
        )}
        {hasResults && (
          <p className="lab-certification">
            {optimum === null
              ? 'Ótimo sem certificação'
              : `Ótimo certificado · ω(G) = ${optimum}${optimum === 0 ? ' · percentuais indefinidos para grafo vazio' : ''}`}
          </p>
        )}
        {focused?.clique && (
          <div className="trace">
            <div>
              <strong>{algorithmNames[focused.algorithm]}</strong>
              <p aria-live="polite">
                {selectedStep
                  ? selectedStep.label
                  : `Clique retornada · ${focused.clique.join(', ') || '∅'}`}
              </p>
            </div>
            {focused.steps.length > 0 &&
              (step === null ? (
                <button className="button" type="button" onClick={() => setStep(0)}>
                  Ver etapas
                </button>
              ) : (
                <div className="step-controls">
                  <button
                    className="button"
                    type="button"
                    onClick={() => setStep(step - 1)}
                    disabled={step === 0}
                  >
                    Anterior
                  </button>
                  <span>
                    {step + 1} / {focused.steps.length}
                  </span>
                  <button
                    className="button"
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={step + 1 === focused.steps.length}
                  >
                    Próxima
                  </button>
                  <button className="button" type="button" onClick={() => setStep(null)}>
                    Resultado final
                  </button>
                </div>
              ))}
          </div>
        )}
        {runFromGraph && runFeedback}
      </section>
      {hasResults && (
        <details className="panel lab-options">
          <summary>Resultados detalhados</summary>
          <ResultsTable results={results} focus={focus} known={optimum} />
        </details>
      )}
      <GraphSettings
        instance={instance}
        disabled={running}
        replace={(next) => {
          clear()
          choose(null)
          setNotice('')
          setInstance(next)
        }}
      />
      <details className="panel lab-options">
        <summary>Execução individual e limites</summary>
        <div className="run-actions">
          {algorithmIds.map((id) => (
            <button
              className="button"
              type="button"
              disabled={running}
              key={id}
              onClick={() => execute([id])}
            >
              {algorithmNames[id]}
            </button>
          ))}
          {running && !runFromGraph && (
            <button className="button danger" type="button" onClick={cancel}>
              Cancelar execução
            </button>
          )}
          <button
            className="button subtle"
            type="button"
            disabled={running || !hasResults}
            onClick={() => {
              clear()
              choose(null)
              setNotice('')
            }}
          >
            Limpar resultados
          </button>
        </div>
        <fieldset disabled={running} className="limit-grid">
          <label>
            Máximo de vértices na força bruta
            <input
              type="number"
              min="0"
              max={MAX_EXACT_LIMIT}
              value={exactLimit}
              onChange={(e) => setExactLimit(e.target.value)}
            />
          </label>
          <label>
            Tempo da força bruta (s)
            <input
              type="number"
              min="0.1"
              max="30"
              step="0.1"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
          <label>
            Rodadas da busca local
            <input
              type="number"
              min="0"
              max="200"
              placeholder="Padrão: número de vértices"
              value={rounds}
              onChange={(e) => setRounds(e.target.value)}
            />
          </label>
        </fieldset>
        {!runFromGraph && runFeedback}
      </details>
    </div>
  )
}
