import {
  chartQueryInputSchema,
  gradeLabel,
  marketPricesQuerySchema,
  metricLabel,
  oilGradeSchema,
  parcelCashflowQuerySchema,
  parcelWeatherQuerySchema,
  querySpecSchema,
  tasksQuerySchema,
  transactionsQuerySchema,
  type ChartQueryInput,
  type OilGrade,
  type ParcelWeatherMetric,
  type QuerySpec,
} from "@workspace/schemas"

export {
  chartQueryInputSchema,
  gradeLabel,
  marketPricesQuerySchema,
  metricLabel,
  oilGradeSchema,
  parcelCashflowQuerySchema,
  parcelWeatherQuerySchema,
  querySpecSchema,
  tasksQuerySchema,
  transactionsQuerySchema,
  type ChartQueryInput,
  type OilGrade,
  type ParcelWeatherMetric,
  type QuerySpec,
}

export type ChartSeriesKind = "line" | "area" | "bar"

export type ChartSeriesSpec = {
  dataKey: string
  label: string
  kind: ChartSeriesKind
  color?: string
}

export type ChartView = {
  title: string
  description?: string
  xDataKey: "date"
  rows: Record<string, unknown>[]
  series: ChartSeriesSpec[]
}

export type QueryResultRow = {
  date: string
  value: number
  label: string
  dataKey: string
}

export type QueryResultError = "not_implemented"

export type QueryResult = {
  query: QuerySpec
  rows: QueryResultRow[]
  label: string
  error?: QueryResultError
}

const CHART_SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function colorForIndex(index: number): string {
  return CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]!
}
