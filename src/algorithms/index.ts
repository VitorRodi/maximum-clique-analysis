import { bruteForce } from './bruteForce'
import { greedy } from './greedy'
import { localSearch } from './localSearch'

export { bruteForce, greedy, localSearch }
export { algorithmIds, algorithmNames } from './types'
export type { AlgorithmId, Result, RunOptions } from './types'

export const algorithms = { bruteForce, greedy, localSearch }

export function qualityIndicators(size: number | null, optimum: number | null) {
  if (size === null || optimum === null || optimum === 0) return null
  return {
    quality: (size / optimum) * 100,
    gap: ((optimum - size) / optimum) * 100,
  }
}
