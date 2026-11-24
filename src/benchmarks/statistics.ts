export function statistics(values: readonly number[]) {
  if (values.length === 0) return { mean: null, median: null, deviation: null }
  const ordered = [...values].sort((a, b) => a - b)
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const center = Math.floor(ordered.length / 2)
  const median = ordered.length % 2 ? ordered[center] : (ordered[center - 1] + ordered[center]) / 2
  const deviation = Math.sqrt(
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length,
  )
  return { mean, median, deviation }
}

export function toCsv(rows: Record<string, string | number | boolean | null>[]) {
  if (!rows.length) return ''
  function cell(value: string | number | boolean | null) {
    if (value === null) return ''
    const text = String(value)
    return /[",\r\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text
  }
  const columns = Object.keys(rows[0])
  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => cell(row[column])).join(',')),
    '',
  ].join('\n')
}
