import { useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import benchmark from '../../results/benchmark-summary.json'
import { algorithmIds, algorithmNames, type AlgorithmId } from '../algorithms'
import { formatNumber, formatPercent, formatTime } from '../utils/format'

const metrics = {
  medianMs: 'Tempo mediano',
  meanSize: 'Cardinalidade média',
  meanQuality: 'Qualidade média',
  meanGap: 'Desvio médio',
} as const
type Metric = keyof typeof metrics
const colors: Record<AlgorithmId, string> = {
  bruteForce: '#20466b',
  greedy: '#596379',
  localSearch: '#117453',
}
const { metadata, groups } = benchmark

function chartValue(metric: Metric, value: number) {
  if (metric === 'medianMs') return formatTime(value)
  if (metric === 'meanSize') return formatNumber(value)
  return formatPercent(value)
}

function ComparisonChart({
  title,
  axis,
  x,
  values,
  metric,
}: {
  title: string
  axis: string
  x: string
  values: number[]
  metric: Metric
}) {
  const rows = values.map((value) => {
    const matches = groups.filter((row) =>
      x === 'n'
        ? row.n === value && row.density === Number(axis)
        : row.density === value && row.n === Number(axis),
    )
    return {
      category: x === 'n' ? String(value) : formatPercent(value * 100),
      bruteForce: matches.find((row) => row.algorithm === 'bruteForce')?.[metric] ?? null,
      greedy: matches.find((row) => row.algorithm === 'greedy')?.[metric] ?? null,
      localSearch: matches.find((row) => row.algorithm === 'localSearch')?.[metric] ?? null,
    }
  })
  const points = rows.flatMap((row) => algorithmIds.flatMap((id) => (row[id] === null ? [] : [row[id]])))
  const log = metric === 'medianMs' && points.every((point) => point > 0)
  const range: [number, number] | ['auto', 'auto'] =
    log && points.length
      ? [
          10 ** Math.floor(Math.log10(Math.min(...points))),
          10 ** Math.ceil(Math.log10(Math.max(...points)) + 0.001),
        ]
      : metric === 'meanQuality' || metric === 'meanGap'
        ? [0, 100]
        : ['auto', 'auto']
  return (
    <section className="panel chart-panel">
      <h2>{title}</h2>
      <p>
        {metrics[metric]}
        {log ? ' · escala logarítmica' : ''}
      </p>
      {points.length ? (
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 14, right: 16, bottom: 6, left: 5 }}>
              <CartesianGrid vertical={false} stroke="#dfe7ea" />
              <XAxis dataKey="category" tick={{ fill: '#435768', fontSize: 12 }} />
              <YAxis
                scale={log ? 'log' : 'linear'}
                domain={range}
                width={76}
                tick={{ fill: '#435768', fontSize: 11 }}
                tickFormatter={(value: number) => chartValue(metric, value)}
              />
              <Tooltip
                formatter={(value) => (typeof value === 'number' ? chartValue(metric, value) : '—')}
              />
              <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
              {algorithmIds.map((id, index) => (
                <Line
                  key={id}
                  type="linear"
                  dataKey={id}
                  name={algorithmNames[id]}
                  stroke={colors[id]}
                  strokeWidth={2}
                  strokeDasharray={index === 1 ? '5 4' : undefined}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="chart-empty">
          O ótimo não foi certificado nesta faixa. Selecione até 20 vértices ou outra métrica.
        </p>
      )}
    </section>
  )
}

export default function Comparison() {
  const [density, setDensity] = useState(0.5)
  const [size, setSize] = useState(20)
  const [metric, setMetric] = useState<Metric>('medianMs')
  const table = groups.filter((row) => row.density === density && row.n === size)
  const best = table.reduce((max, row) => Math.max(max, row.bestSize ?? 0), 0)
  return (
    <>
      <div className="page-heading">
        <h1>Comparação experimental</h1>
        <p>
          Benchmark em {metadata.runtime} {metadata.node}, com {metadata.seeds.length} sementes e{' '}
          {metadata.repetitions} repetições por instância.
        </p>
      </div>
      <div className="panel experiment-controls">
        <label>
          Métrica dos gráficos
          <select value={metric} onChange={(e) => setMetric(e.target.value as Metric)}>
            {Object.entries(metrics).map(([key, label]) => (
              <option value={key} key={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Densidade nominal
          <select value={density} onChange={(e) => setDensity(Number(e.target.value))}>
            {metadata.densities.map((p) => (
              <option value={p} key={p}>
                {formatPercent(p * 100)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Quantidade de vértices
          <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
            {metadata.sizes.map((n) => (
              <option value={n} key={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="experiment-charts">
        <ComparisonChart
          title={`Por tamanho · ${formatPercent(100 * density)}`}
          x="n"
          axis={String(density)}
          values={metadata.sizes}
          metric={metric}
        />
        <ComparisonChart
          title={`Por densidade · ${size} vértices`}
          x="density"
          axis={String(size)}
          values={metadata.densities}
          metric={metric}
        />
      </div>
      <section className="panel experiment-table">
        <div className="panel-header">
          <div>
            <h2>
              {size} vértices · {formatPercent(100 * density)} nominal
            </h2>
            <p>
              Densidade efetiva média de {formatPercent(100 * (table[0]?.effectiveDensity ?? 0))} ·
              melhor cardinalidade observada {best}.
            </p>
          </div>
        </div>
        <div
          className="table-scroll"
          tabIndex={0}
          aria-label="Tabela de benchmark com rolagem horizontal"
        >
          <table>
            <caption className="sr-only">Agregados Node.js na configuração selecionada</caption>
            <thead>
              <tr>
                <th scope="col">Algoritmo</th>
                <th scope="col">Concluídas</th>
                <th scope="col">Mediana</th>
                <th scope="col">Média ± DP</th>
                <th scope="col">Card. média / melhor</th>
                <th scope="col">Qualidade / desvio</th>
                <th scope="col">Validade</th>
                <th scope="col">Ótimos atingidos</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.algorithm}>
                  <th scope="row">
                    {algorithmNames[row.algorithm as AlgorithmId]}
                    {row.skipped > 0 && <small>{row.skipped} não executadas</small>}
                    {row.interrupted > 0 && <small>{row.interrupted} interrompidas</small>}
                  </th>
                  <td>{row.completed}</td>
                  <td>{formatTime(row.medianMs)}</td>
                  <td>
                    {row.meanMs === null
                      ? '—'
                      : `${formatTime(row.meanMs)} ± ${formatTime(row.deviationMs)}`}
                  </td>
                  <td>
                    {row.meanSize === null ? '—' : `${formatNumber(row.meanSize)} / ${row.bestSize}`}
                  </td>
                  <td>
                    {row.meanQuality === null
                      ? '—'
                      : `${formatPercent(row.meanQuality)} / ${formatPercent(row.meanGap ?? 0)}`}
                  </td>
                  <td>{row.meanSize === null ? '—' : 'Válidas'}</td>
                  <td>{row.known ? `${row.optimalMatches} / ${row.known}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="experiment-note">
          O ótimo foi certificado em {Math.max(...table.map((row) => row.known))} de{' '}
          {metadata.seeds.length} instâncias desta configuração. Médias percentuais consideram somente os
          casos certificados. Os tempos excluem geração e renderização.
        </p>
      </section>
    </>
  )
}
