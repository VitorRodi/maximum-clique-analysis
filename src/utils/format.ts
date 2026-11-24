export const formatNumber = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits }).format(value)

export const formatPercent = (value: number) => `${formatNumber(value)}%`

export function formatTime(value: number | null) {
  if (value === null) return '—'
  if (value < 0.0001) return '< 0,0001 ms'
  return `${formatNumber(value, 4)} ms`
}
