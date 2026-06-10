import type { ChartSeriesKind, QueryResult } from "../schemas/chart-action-schema"
import { colorForIndex } from "../schemas/chart-action-schema"
import type { AnswerFocus } from "../schemas/copilot-intent-schema"
import { COPILOT_REFERENCE_DATE } from "../schemas/copilot-intent-schema"
import type {
  CellSpec,
  DashboardCellsPayload,
  ResolvedCell,
} from "../schemas/dashboard-grid-schema"
import { createEmptyDashboardCells } from "../schemas/dashboard-grid-schema"
import { processChartView } from "./process-chart-view"
import type { ChartQueryInput } from "../schemas/copilot-queries"
import { inferDashboardCells } from "./infer-dashboard-cells"
import { validateDashboardCells } from "./validate-dashboard-cells"

const DONUT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
]

function pickRow(
  rows: QueryResult["rows"],
  focus: AnswerFocus
): QueryResult["rows"][number] | undefined {
  if (rows.length === 0) return undefined
  if (focus === "today") {
    return (
      rows.find((row) => row.date === COPILOT_REFERENCE_DATE) ?? rows.at(-1)
    )
  }
  if (focus === "latest") return rows.at(-1)
  return rows.at(-1)
}

function formatKpiValue(
  result: QueryResult,
  focus: AnswerFocus
): { value: string; unit?: string } {
  const query = result.query
  const row = pickRow(result.rows, focus)
  if (!row) return { value: "—" }

  if (query.source === "parcelWeather") {
    const unit =
      query.metric === "temperature"
        ? "°C"
        : query.metric === "rainfall"
          ? "mm"
          : "%"
    return { value: String(row.value), unit }
  }
  if (query.source === "marketPrices") {
    return { value: row.value.toFixed(2), unit: "€/kg" }
  }
  if (query.source === "transactions" || query.source === "parcelCashflow") {
    return { value: row.value.toFixed(2), unit: "€" }
  }
  return { value: String(row.value) }
}

function buildKpiCell(
  spec: Extract<CellSpec, { kind: "kpi" }>,
  results: QueryResult[],
  focus: AnswerFocus
): ResolvedCell {
  const result = results[spec.queryIndex]
  if (!result || result.error || result.rows.length === 0) {
    return { kind: "empty" }
  }
  const { value, unit } = formatKpiValue(result, focus)
  return { kind: "kpi", title: spec.title, value, unit }
}

function buildDonutCell(
  spec: Extract<CellSpec, { kind: "donut" }>,
  results: QueryResult[]
): ResolvedCell {
  const result = results[spec.queryIndex]
  if (!result || result.error || result.rows.length === 0) {
    return { kind: "empty" }
  }

  const totals = new Map<string, number>()
  for (const row of result.rows) {
    const key = row.label || row.dataKey
    totals.set(key, (totals.get(key) ?? 0) + row.value)
  }

  const slices = [...totals.entries()].map(([category, amount], index) => ({
    category,
    amount,
    fill: DONUT_COLORS[index % DONUT_COLORS.length]!,
  }))

  if (slices.length === 0) return { kind: "empty" }

  return { kind: "donut", title: spec.title, slices }
}

function buildAlertCell(spec: Extract<CellSpec, { kind: "alert" }>): ResolvedCell {
  return {
    kind: "alert",
    title: spec.title,
    severity: spec.severity,
    message: spec.message,
  }
}

function buildChartCell(
  spec: Extract<CellSpec, { kind: "line" | "bar" }>,
  results: QueryResult[]
): ResolvedCell {
  const indices = spec.queryIndices ?? [spec.queryIndex]
  const selected = indices
    .map((i) => results[i])
    .filter((r): r is QueryResult => r !== undefined && !r.error)

  if (selected.length === 0 || selected.every((r) => r.rows.length === 0)) {
    return { kind: "empty" }
  }

  const action: ChartQueryInput = {
    title: spec.title,
    queries: selected.map((r) => r.query),
  }
  const view = processChartView(action, selected)
  const forcedKind: ChartSeriesKind = spec.kind === "bar" ? "bar" : "line"

  const chartView = {
    ...view,
    series: view.series.map((series, index) => ({
      ...series,
      kind: forcedKind,
      color: series.color ?? colorForIndex(index),
    })),
  }

  if (spec.kind === "line") {
    return { kind: "line", title: spec.title, view: chartView }
  }
  return { kind: "bar", title: spec.title, view: chartView }
}

function buildTableCell(
  spec: Extract<CellSpec, { kind: "table" }>,
  results: QueryResult[]
): ResolvedCell {
  const result = results[spec.queryIndex]
  if (!result || result.error) return { kind: "empty" }

  const rows: Record<string, string | number>[] = []
  for (const row of result.rows) {
    rows.push({
      date: row.date,
      label: row.label,
      value: row.value,
    })
  }
  rows.sort((a, b) => String(a.date).localeCompare(String(b.date)))

  if (rows.length === 0) return { kind: "empty" }

  return {
    kind: "table",
    title: spec.title,
    columns: [
      { key: "date", label: "Fecha" },
      { key: "label", label: "Concepto" },
      { key: "value", label: "Valor" },
    ],
    rows,
  }
}

function buildSingleCell(
  spec: CellSpec,
  results: QueryResult[],
  focus: AnswerFocus
): ResolvedCell {
  switch (spec.kind) {
    case "empty":
      return { kind: "empty" }
    case "kpi":
      return buildKpiCell(spec, results, focus)
    case "donut":
      return buildDonutCell(spec, results)
    case "alert":
      return buildAlertCell(spec)
    case "line":
    case "bar":
      return buildChartCell(spec, results)
    case "table":
      return buildTableCell(spec, results)
  }
}

export function buildDashboardCells(
  specs: CellSpec[] | undefined,
  results: QueryResult[],
  focus: AnswerFocus,
  options: { userText?: string } = {}
): DashboardCellsPayload {
  const base = createEmptyDashboardCells()
  const resolvedSpecs = validateDashboardCells(
    specs && specs.length === 6
      ? specs
      : inferDashboardCells(results, focus, options.userText ?? ""),
    results
  )

  for (const spec of resolvedSpecs) {
    base[spec.slot] = buildSingleCell(spec, results, focus)
  }

  return base
}
