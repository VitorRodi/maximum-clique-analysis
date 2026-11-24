import {
  algorithmIds,
  algorithmNames,
  qualityIndicators,
  type AlgorithmId,
  type Result,
} from '../algorithms'
import { type StopReason } from '../algorithms/types'
import { formatNumber, formatPercent, formatTime } from '../utils/format'

const reasons: Record<StopReason, string> = {
  finished: 'Concluído',
  'vertex-limit': 'Limite de vértices',
  'time-limit': 'Interrompido por tempo',
  'no-improvement': 'Sem melhoria na vizinhança',
  'round-limit': 'Limite de rodadas',
  'user-cancelled': 'Cancelado',
}

export function ResultsTable({
  results,
  focus,
  onFocus,
}: {
  results: Partial<Record<AlgorithmId, Result>>
  focus: AlgorithmId | null
  onFocus: (id: AlgorithmId) => void
}) {
  const known = results.bruteForce?.certified ? (results.bruteForce.clique?.length ?? null) : null
  const sizes = Object.values(results).flatMap((result) =>
    result.clique === null ? [] : [result.clique.length],
  )
  return (
    <>
      <p className="result-context">
        {known !== null
          ? `Ótimo certificado · ω(G) = ${known}${known === 0 ? ' · percentuais indefinidos para grafo vazio' : ''}`
          : sizes.length
            ? `Melhor cardinalidade encontrada · ${Math.max(...sizes)} · ótimo sem certificação`
            : 'Execute um algoritmo para medir o tempo e conferir a clique retornada.'}
      </p>
      <div className="table-scroll" tabIndex={0} aria-label="Resultados com rolagem horizontal">
        <table>
          <caption className="sr-only">Resultados da instância ativa medidos no navegador</caption>
          <thead>
            <tr>
              <th scope="col">Algoritmo</th>
              <th scope="col">Tamanho</th>
              <th scope="col">Vértices</th>
              <th scope="col">Tempo</th>
              <th scope="col">Validade / garantia</th>
              <th scope="col">Qualidade / desvio</th>
              <th scope="col">Operações</th>
            </tr>
          </thead>
          <tbody>
            {algorithmIds.map((id) => {
              const result = results[id]
              const size = result?.clique?.length ?? null
              const indicators = qualityIndicators(size, known)
              const ops = result?.operations
              return (
                <tr key={id} className={focus === id && result?.clique ? 'selected-row' : undefined}>
                  <th scope="row">
                    {result?.clique ? (
                      <button
                        type="button"
                        className="link-button"
                        aria-pressed={focus === id}
                        onClick={() => onFocus(id)}
                      >
                        {algorithmNames[id]}
                      </button>
                    ) : (
                      algorithmNames[id]
                    )}
                    <small>{result ? reasons[result.reason] : 'Aguardando execução'}</small>
                  </th>
                  <td className="cardinality">{size ?? '—'}</td>
                  <td>{result?.clique ? result.clique.join(', ') || '∅' : '—'}</td>
                  <td>
                    {formatTime(result?.status === 'skipped' ? null : (result?.elapsedMs ?? null))}
                  </td>
                  <td>
                    {result?.valid === true ? (
                      <>
                        <span className="valid">Válida</span>
                        <small>
                          {result.certified
                            ? 'Ótimo certificado'
                            : id === 'greedy'
                              ? 'Maximal · sem garantia global'
                              : 'Sem garantia global'}
                        </small>
                      </>
                    ) : result?.valid === false ? (
                      'Inválida'
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {indicators
                      ? `${formatPercent(indicators.quality)} / ${formatPercent(indicators.gap)}`
                      : '—'}
                  </td>
                  <td>
                    {ops && result?.clique ? (
                      <>
                        {formatNumber(ops.adjacencyChecks, 0)} consultas
                        {id === 'bruteForce' && (
                          <small>{formatNumber(ops.subsets, 0)} subconjuntos</small>
                        )}
                        {id === 'localSearch' && (
                          <small>
                            {ops.swaps} trocas · {ops.rounds} rodadas
                          </small>
                        )}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
