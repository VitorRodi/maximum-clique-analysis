import { expect, it } from 'vitest'
import { bruteForce } from '../src/algorithms/bruteForce'
import { generateGraph } from '../src/graphs/graphGenerator'
import { presets } from '../src/graphs/predefinedGraphs'

it('certifica a clique A, B, C, D após enumerar os 512 subconjuntos do TPE', () => {
  const result = bruteForce(presets.tpe.create(), { trace: true })
  expect(result.clique).toEqual(['A', 'B', 'C', 'D'])
  expect(result.certified).toBe(true)
  expect(result.valid).toBe(true)
  expect(result.operations.subsets).toBe(512)
  expect(result.steps.at(-1)?.clique).toEqual(result.clique)
})

it('certifica clique vazia em grafo vazio', () => {
  expect(bruteForce(presets.empty.create())).toMatchObject({ clique: [], certified: true, valid: true })
})

it('recusa instância acima do limite antes de enumerar', () => {
  expect(bruteForce(generateGraph(21, 0.5, 2))).toMatchObject({
    status: 'skipped',
    certified: false,
    clique: null,
    operations: { subsets: 0 },
  })
})

it('retorna incumbente válida e sem certificado quando atinge o limite de tempo', () => {
  expect(bruteForce(presets.tpe.create(), { maxMilliseconds: 0 })).toMatchObject({
    status: 'interrupted',
    certified: false,
    clique: [],
    valid: true,
  })
})

it('valida limites antes de executar', () => {
  expect(() => bruteForce(presets.tpe.create(), { maxVertices: 25 })).toThrow()
  expect(() => bruteForce(presets.tpe.create(), { maxMilliseconds: NaN })).toThrow()
})
