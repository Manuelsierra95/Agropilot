import {
  colorForIndex,
  type ChartSeriesKind,
  type ChartView,
  type QueryResult,
  type RenderChartInput,
} from "../schemas/chart-action-schema"

function defaultSeriesKind(query: QueryResult["query"]): ChartSeriesKind {
  if (query.source === "marketPrices" || query.source === "parcelWeather") {
    return "line"
  }
  if (query.source === "tasks") {
    return "bar"
  }
  return "area"
}

export function processChartView(
  action: RenderChartInput,
  results: QueryResult[]
): ChartView {
  const seriesMap = new Map<
    string,
    { dataKey: string; label: string; kind: ChartSeriesKind; color?: string }
  >()

  for (const [index, result] of results.entries()) {
    const keys = new Set(result.rows.map((row) => row.dataKey))
    for (const dataKey of keys) {
      const uniqueKey = seriesMap.has(dataKey) ? `${dataKey}__${index}` : dataKey
      if (seriesMap.has(uniqueKey)) continue

      const sample = result.rows.find((row) => row.dataKey === dataKey)
      seriesMap.set(uniqueKey, {
        dataKey: uniqueKey,
        label: sample?.label ?? result.label,
        kind: defaultSeriesKind(result.query),
        color: colorForIndex(seriesMap.size),
      })

      if (uniqueKey !== dataKey) {
        for (const row of result.rows) {
          if (row.dataKey === dataKey) {
            row.dataKey = uniqueKey
          }
        }
      }
    }

    if (keys.size === 0) {
      const fallbackKey = `series_${index}`
      seriesMap.set(fallbackKey, {
        dataKey: fallbackKey,
        label: result.label,
        kind: defaultSeriesKind(result.query),
        color: colorForIndex(seriesMap.size),
      })
    }
  }

  const rowsByDate = new Map<string, Record<string, unknown>>()

  for (const result of results) {
    for (const row of result.rows) {
      const existing = rowsByDate.get(row.date) ?? { date: row.date }
      const previous = existing[row.dataKey]
      existing[row.dataKey] =
        typeof previous === "number" ? previous + row.value : row.value
      rowsByDate.set(row.date, existing)
    }
  }

  const rows = [...rowsByDate.values()].sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  )

  if (rows.length === 0) {
    throw new Error("No hay datos para el rango y filtros solicitados")
  }

  const series = [...seriesMap.values()]

  return {
    title: action.title,
    description: `${results.length} consulta${results.length === 1 ? "" : "s"} procesada${results.length === 1 ? "" : "s"}`,
    xDataKey: "date",
    rows,
    series,
  }
}
