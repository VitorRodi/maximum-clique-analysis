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
  const { results, running, error, run, cancel, clear } = useExecution()
  const { graph, preset, name } = instance
  const focused = focus === null ? undefined : results[focus]
  const selectedStep = step === null ? undefined : focused?.steps[step]
  const highlight = selectedStep?.clique ?? focused?.clique ?? undefined

  function choose(id: AlgorithmId | null) {
    setFocus(id)
    setStep(null)
  }

  function execute(ids: AlgorithmId[]) {
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

  return (
    <>
      <div className="page-heading">
        <h1>Laboratório de grafos</h1>
        <p>Monte uma instância, execute os algoritmos e inspecione as cliques encontradas.</p>
      </div>
      <div className="lab-layout">
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
        <section className="panel graph-panel" aria-labelledby="graph-name">
          <div className="panel-header">
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
          <Suspense
            fallback={
              <p className="graph-stage grid place-items-center" role="status">
                Carregando grafo…
              </p>
            }
          >
            <GraphView
              key={graph.vertices.join('\u0000') + name}
              graph={graph}
              tpe={preset === 'tpe'}
              highlight={highlight}
            />
          </Suspense>
          <div className="trace">
            {focused?.clique ? (
              <>
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
              </>
            ) : (
              <p>Selecione um resultado para destacar a clique e percorrer as etapas.</p>
            )}
          </div>
        </section>
      </div>
      <section className="panel run-panel" aria-labelledby="execution">
        <div className="panel-header">
          <div>
            <h2 id="execution">Execução dos algoritmos</h2>
            <p>Medições realizadas no navegador</p>
          </div>
          <button
            className="button subtle"
            type="button"
            disabled={running || Object.keys(results).length === 0}
            onClick={() => {
              clear()
              choose(null)
              setNotice('')
            }}
          >
            Limpar resultados
          </button>
        </div>
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
          <button
            className="button primary"
            type="button"
            disabled={running}
            onClick={() => execute(algorithmIds)}
          >
            Executar todos
          </button>
          <button className="button danger" type="button" disabled={!running} onClick={cancel}>
            Cancelar execução
          </button>
        </div>
        <details className="run-config">
          <summary>Limites de execução</summary>
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
        </details>
        <p className="execution-status" role="status">
          {running
            ? 'Executando em segundo plano…'
            : Object.keys(results).length
              ? 'Resultados atualizados.'
              : ''}
        </p>
        {(notice || error) && (
          <p className="error" role="alert">
            {notice || error}
          </p>
        )}
        <ResultsTable results={results} focus={focus} onFocus={choose} />
      </section>
    </>
  )
}
