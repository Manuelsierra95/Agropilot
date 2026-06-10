import type { ChartSeriesKind, QueryResult } from "../schemas/chart-action-schema"
import type { AnswerFocus } from "../schemas/copilot-intent-schema"
import { COPILOT_REFERENCE_DATE } from "../schemas/copilot-intent-schema"
import { formatDataAnswer } from "./format-data-answer"
import { processChartView } from "./process-chart-view"
import type { ChartQueryInput } from "../schemas/copilot-queries"
import type {
  DataPresentation,
  Widget,
  WidgetSpec,
} from "../schemas/widget-schema"
import { inferWidgetSpecs } from "./infer-widget-specs"

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

  if (focus === "latest") {
    return rows.at(-1)
  }

  return rows.at(-1)
}

function formatKpiValue(result: QueryResult, focus: AnswerFocus): {
  value: string
  unit?: string
} {
  const query = result.query
  const row = pickRow(result.rows, focus)

  if (!row) {
    return { value: "—" }
  }

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

function buildKpiWidget(
  spec: Extract<WidgetSpec, { type: "kpi" }>,
  results: QueryResult[],
  focus: AnswerFocus
): Widget {
  const index = spec.queryIndex ?? 0
  const result = results[index] ?? results[0]

  if (!result) {
    return { type: "kpi", title: spec.title, value: "—" }
  }

  const { value, unit } = formatKpiValue(result, focus)
  return {
    type: "kpi",
    title: spec.title,
    value,
    unit,
  }
}

function buildTableWidget(
  spec: Extract<WidgetSpec, { type: "table" }>,
  results: QueryResult[]
): Widget {
  const index = spec.queryIndex ?? 0
  const scoped = results[index] ? [results[index]!] : results

  const rows: Record<string, string | number>[] = []

  for (const result of scoped) {
    for (const row of result.rows) {
      rows.push({
        date: row.date,
        label: row.label,
        value: row.value,
      })
    }
  }

  rows.sort((a, b) => String(a.date).localeCompare(String(b.date)))

  return {
    type: "table",
    title: spec.title,
    columns: [
      { key: "date", label: "Fecha" },
      { key: "label", label: "Concepto" },
      { key: "value", label: "Valor" },
    ],
    rows,
  }
}

function buildChartWidget(
  spec: Extract<WidgetSpec, { type: "line_chart" | "bar_chart" }>,
  results: QueryResult[]
): Widget {
  const indices =
    spec.queryIndices ?? results.map((_, index) => index)
  const selected = indices
    .map((i) => results[i])
    .filter((r): r is QueryResult => r !== undefined)

  const action: ChartQueryInput = {
    title: spec.title,
    queries: selected.map((r) => r.query),
  }

  const view = processChartView(action, selected)

  const forcedKind: ChartSeriesKind =
    spec.type === "bar_chart" ? "bar" : "line"

  return {
    type: spec.type,
    view: {
      ...view,
      series: view.series.map((series) => ({
        ...series,
        kind: forcedKind,
      })),
    },
  }
}

function buildAlertWidget(
  spec: Extract<WidgetSpec, { type: "alert" }>
): Widget {
  return {
    type: "alert",
    title: spec.title,
    severity: spec.severity,
    message: spec.message,
  }
}

function buildSingleWidget(
  spec: WidgetSpec,
  results: QueryResult[],
  focus: AnswerFocus
): Widget {
  switch (spec.type) {
    case "kpi":
      return buildKpiWidget(spec, results, focus)
    case "table":
      return buildTableWidget(spec, results)
    case "line_chart":
    case "bar_chart":
      return buildChartWidget(spec, results)
    case "alert":
      return buildAlertWidget(spec)
  }
}

export function buildWidgets(
  specs: WidgetSpec[] | undefined,
  results: QueryResult[],
  focus: AnswerFocus,
  options: {
    message?: string
    userText?: string
    fallbackTitle?: string
  } = {}
): DataPresentation {
  const resolvedSpecs =
    specs && specs.length > 0
      ? specs
      : inferWidgetSpecs(
          results,
          focus,
          options.userText ?? "",
          options.fallbackTitle
        )

  const widgets = resolvedSpecs.map((spec) =>
    buildSingleWidget(spec, results, focus)
  )

  const message =
    options.message ?? formatDataAnswer(focus, results)

  return { message, widgets }
}
