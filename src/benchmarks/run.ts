import { mkdirSync, writeFileSync } from 'node:fs'
import { cpus, platform, release, arch } from 'node:os'
import {
  algorithmIds,
  algorithms,
  qualityIndicators,
  type AlgorithmId,
  type Result,
} from '../algorithms'
import { DEFAULT_EXACT_LIMIT, DEFAULT_TIME_LIMIT_MS } from '../algorithms/bruteForce'
import { type Graph } from '../graphs/adjacencyMatrix'
import { generateGraph } from '../graphs/graphGenerator'
import { presets } from '../graphs/predefinedGraphs'
import { statistics, toCsv } from './statistics'

const sizes = [5, 10, 15, 20, 30, 50, 100, 200]
const densities = [0.2, 0.5, 0.8]
const seeds = [11, 23, 37, 53, 71]
const repetitions = 5
const metadata = {
  measuredAt: new Date().toISOString(),
  runtime: 'Node.js',
  node: process.version,
  v8: process.versions.v8,
  platform: platform(),
  release: release(),
  arch: arch(),
  cpu: cpus()[0]?.model ?? null,
  logicalCpus: cpus().length,
  sizes,
  densities,
  seeds,
  repetitions,
  warmupPerInstance: 1,
  exactVertexLimit: DEFAULT_EXACT_LIMIT,
  exactTimeLimitMs: DEFAULT_TIME_LIMIT_MS,
}

function measure(
  create: () => Graph,
  nominalDensity: number | null,
  seed: number | null,
  instance: string,
) {
  const start = performance.now()
  const graph = create()
  const generationMs = performance.now() - start
  const info = {
    instance,
    n: graph.size,
    edges: graph.edgeCount,
    effectiveDensity: graph.density,
    nominalDensity,
    seed,
    generationMs,
  }
  const results: { repetition: number; result: Result }[] = []
  for (const id of algorithmIds) {
    if (id !== 'bruteForce' || graph.size <= DEFAULT_EXACT_LIMIT) algorithms[id](graph)
  }
  for (let repetition = 1; repetition <= repetitions; repetition++) {
    for (let offset = 0; offset < algorithmIds.length; offset++) {
      const id = algorithmIds[(offset + repetition - 1) % algorithmIds.length]
      const result = algorithms[id](graph)
      if (result.clique !== null && !result.valid)
        throw new Error(`Clique inválida em ${instance}: ${id}.`)
      results.push({ repetition, result })
    }
  }
  const certified = results.find(({ result }) => result.certified)
  const optimum = certified?.result.clique?.length ?? null
  const samples = results.map(({ repetition, result }) => ({
    ...info,
    repetition,
    algorithm: result.algorithm,
    status: result.status,
    reason: result.reason,
    elapsedMs: result.status === 'skipped' ? null : result.elapsedMs,
    clique: result.clique?.join(' ') ?? null,
    size: result.clique?.length ?? null,
    valid: result.valid,
    certified: result.certified,
    optimum,
    ...result.operations,
  }))
  const aggregates = algorithmIds.map((algorithm) => {
    const rows = samples.filter((row) => row.algorithm === algorithm)
    const complete = rows.filter((row) => row.status === 'completed')
    const best = rows.reduce<number | null>((current, row) => {
      if (row.size === null) return current
      return current === null ? row.size : Math.max(current, row.size)
    }, null)
    if (optimum !== null && best !== null && best > optimum)
      throw new Error(`Cardinalidade acima do ótimo em ${instance}.`)
    const time = statistics(complete.flatMap((row) => (row.elapsedMs === null ? [] : [row.elapsedMs])))
    const quality = qualityIndicators(best, optimum)
    return {
      ...info,
      algorithm,
      completed: complete.length,
      interrupted: rows.filter((row) => row.status === 'interrupted').length,
      skipped: rows.filter((row) => row.status === 'skipped').length,
      meanMs: time.mean,
      medianMs: time.median,
      deviationMs: time.deviation,
      size: best,
      valid: best === null ? null : rows.every((row) => row.valid !== false),
      optimum,
      quality: quality?.quality ?? null,
      gap: quality?.gap ?? null,
    }
  })
  return { samples, aggregates }
}

const random = sizes.flatMap((n) =>
  densities.flatMap((p) =>
    seeds.map((seed) => measure(() => generateGraph(n, p, seed), p, seed, `n${n}-p${p}-s${seed}`)),
  ),
)
const example = measure(presets.tpe.create, null, null, 'tpe')
const samples = [...random, example].flatMap((group) => group.samples)
const instances = [...random, example].flatMap((group) => group.aggregates)

function summarize(n: number, density: number, algorithm: AlgorithmId) {
  const rows = instances.filter(
    (row) => row.n === n && row.nominalDensity === density && row.algorithm === algorithm,
  )
  const complete = samples.filter(
    (row) =>
      row.n === n &&
      row.nominalDensity === density &&
      row.algorithm === algorithm &&
      row.status === 'completed',
  )
  const time = statistics(complete.flatMap((row) => (row.elapsedMs === null ? [] : [row.elapsedMs])))
  const available = rows.flatMap((row) => (row.size === null ? [] : [row.size]))
  const comparable = rows.filter((row) => row.quality !== null)
  const quality = statistics(comparable.map((row) => row.quality!)).mean
  return {
    n,
    density,
    algorithm,
    instances: rows.length,
    completed: complete.length,
    skipped: rows.reduce((sum, row) => sum + row.skipped, 0),
    interrupted: rows.reduce((sum, row) => sum + row.interrupted, 0),
    effectiveDensity: statistics(rows.map((row) => row.effectiveDensity)).mean,
    meanMs: time.mean,
    medianMs: time.median,
    deviationMs: time.deviation,
    meanSize: statistics(available).mean,
    bestSize: available.length ? Math.max(...available) : null,
    known: comparable.length,
    optimalMatches: comparable.filter((row) => row.size === row.optimum).length,
    meanQuality: quality,
    meanGap: quality === null ? null : 100 - quality,
  }
}
const groups = sizes.flatMap((n) =>
  densities.flatMap((p) => algorithmIds.map((id) => summarize(n, p, id))),
)

mkdirSync('results', { recursive: true })
writeFileSync('results/benchmark.json', JSON.stringify({ metadata, samples, instances }, null, 2) + '\n')
writeFileSync(
  'results/benchmark-summary.json',
  JSON.stringify({ metadata, groups, example: example.aggregates }, null, 2) + '\n',
)
writeFileSync('results/benchmark-samples.csv', toCsv(samples))
writeFileSync('results/benchmark-instances.csv', toCsv(instances))
writeFileSync('results/benchmark-summary.csv', toCsv(groups))

console.log(
  `${random.length} instâncias aleatórias + TPE, ${samples.length} registros medidos ou classificados.`,
)
for (const id of algorithmIds) {
  const rows = samples.filter((row) => row.algorithm === id)
  console.log(
    `${id}: ${rows.filter((row) => row.status === 'completed').length} completas, ${rows.filter((row) => row.status === 'skipped').length} não executadas, ${rows.filter((row) => row.status === 'interrupted').length} interrompidas`,
  )
}
console.table(
  example.aggregates.map(({ algorithm, size, optimum, medianMs, quality }) => ({
    algorithm,
    size,
    optimum,
    medianMs,
    quality,
  })),
)
