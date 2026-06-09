import type { QueryResult } from "../schemas/chart-action-schema"

export function daysBetween(from: string, to: string): number {
  const start = new Date(`${from}T00:00:00Z`).getTime()
  const end = new Date(`${to}T00:00:00Z`).getTime()
  return Math.round(Math.abs(end - start) / (1000 * 60 * 60 * 24))
}

export function totalRowCount(results: QueryResult[]): number {
  return results.reduce((sum, r) => sum + r.rows.length, 0)
}

export function maxSpanDays(results: QueryResult[]): number {
  if (results.length === 0) return 0
  return Math.max(
    ...results.map((r) => daysBetween(r.query.from, r.query.to)),
    0
  )
}

export function defaultResultTitle(results: QueryResult[]): string {
  if (results.length === 1) return results[0]!.label
  return results.map((r) => r.label).join(" · ")
}

export function hasMultipleCategories(results: QueryResult[]): boolean {
  if (results.length > 1) {
    const sources = new Set(
      results.map((r) => {
        const q = r.query
        if (q.source === "parcelWeather") return `${q.source}:${q.metric}`
        if (q.source === "marketPrices") return `${q.source}:${q.grade}`
        return q.source
      })
    )
    if (sources.size > 1) return true
  }

  const dataKeys = new Set<string>()
  for (const result of results) {
    for (const row of result.rows) {
      dataKeys.add(row.dataKey)
    }
  }
  return dataKeys.size > 1
}
