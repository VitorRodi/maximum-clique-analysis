import { expect, it } from 'vitest'
import { localSearch, qualityIndicators } from '../src/algorithms'
import { presets } from '../src/graphs/predefinedGraphs'

it('troca X por C e insere D após partir do guloso', () => {
  const result = localSearch(presets.tpe.create(), { trace: true })
  expect(result.clique).toEqual(['A', 'B', 'C', 'D'])
  expect(result.steps.map((step) => step.clique)).toEqual([
    ['X', 'A', 'B'],
    ['A', 'B', 'C'],
    ['A', 'B', 'C', 'D'],
  ])
  expect(result).toMatchObject({ valid: true, certified: false, reason: 'no-improvement' })
})

it('preserva a clique inicial quando nenhuma rodada é autorizada', () => {
  expect(localSearch(presets.tpe.create(), { maxRounds: 0 })).toMatchObject({
    clique: ['X', 'A', 'B'],
    reason: 'round-limit',
  })
  expect(() => localSearch(presets.tpe.create(), { maxRounds: -1 })).toThrow()
})

it('calcula qualidade e desvio somente para um ótimo positivo conhecido', () => {
  expect(qualityIndicators(3, 4)).toEqual({ quality: 75, gap: 25 })
  expect(qualityIndicators(0, 0)).toBeNull()
  expect(qualityIndicators(5, null)).toBeNull()
  expect(qualityIndicators(null, 5)).toBeNull()
})
