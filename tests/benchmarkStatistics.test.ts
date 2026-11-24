import { expect, it } from 'vitest'
import { statistics, toCsv } from '../src/benchmarks/statistics'

it('usa média, mediana e desvio padrão populacional sem reordenar os dados brutos', () => {
  const data = [3, 1, 1, 3]
  expect(statistics(data)).toEqual({ mean: 2, median: 2, deviation: 1 })
  expect(data).toEqual([3, 1, 1, 3])
  expect(statistics([7])).toEqual({ mean: 7, median: 7, deviation: 0 })
  expect(statistics([])).toEqual({ mean: null, median: null, deviation: null })
})

it('exporta valores ausentes e escapa campos CSV com separadores e aspas', () => {
  expect(toCsv([{ name: 'A, "B"', duration: null, valid: true }])).toBe(
    'name,duration,valid\n"A, ""B""",,true\n',
  )
})
