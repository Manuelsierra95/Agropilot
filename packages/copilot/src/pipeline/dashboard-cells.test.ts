import assert from "node:assert/strict"

import type { QueryResult } from "../schemas/chart-action-schema"
import type { CellSpec } from "../schemas/dashboard-grid-schema"
import { buildDashboardCells } from "./build-dashboard-cells"
import { inferDashboardCells } from "./infer-dashboard-cells"
import { validateDashboardCells } from "./validate-dashboard-cells"
import { widgetSpecsToDashboardCells } from "./widget-specs-to-dashboard-cells"

function transactionsResult(
  from: string,
  to: string,
  rows: QueryResult["rows"]
): QueryResult {
  return {
    query: { source: "transactions", from, to },
    label: "Transacciones",
    rows,
  }
}

function weatherResult(
  from: string,
  to: string,
  metric: "temperature" | "rainfall" = "temperature"
): QueryResult {
  const rows = Array.from({ length: 5 }, (_, i) => ({
    date: `2026-06-0${i + 1}`,
    value: 20 + i,
    label: metric === "temperature" ? "Temp" : "Lluvia",
    dataKey: metric,
  }))
  return {
    query: { source: "parcelWeather", metric, from, to },
    label: metric === "temperature" ? "Temperatura" : "Precipitación",
    rows,
  }
}

const financeCells: CellSpec[] = [
  { slot: "top_a", kind: "kpi", title: "Balance", queryIndex: 0 },
  { slot: "top_b", kind: "donut", title: "Gastos", queryIndex: 0 },
  { slot: "top_c", kind: "alert", title: "Alertas", severity: "low", message: "OK" },
  { slot: "main", kind: "line", title: "Evolución", queryIndex: 0 },
  { slot: "secondary", kind: "bar", title: "Comparativa", queryIndex: 0 },
  { slot: "detail", kind: "table", title: "Detalle", queryIndex: 0 },
]

const climateCells: CellSpec[] = [
  { slot: "top_a", kind: "kpi", title: "Riesgo", queryIndex: 0 },
  { slot: "top_b", kind: "empty" },
  { slot: "top_c", kind: "alert", title: "Clima", severity: "medium", message: "Vigilar heladas" },
  { slot: "main", kind: "line", title: "Temperatura", queryIndex: 0 },
  { slot: "secondary", kind: "bar", title: "Lluvia", queryIndex: 1 },
  { slot: "detail", kind: "table", title: "Detalle", queryIndex: 0 },
]

function runTests() {
  const categoricalRows = [
    { date: "2026-06-01", value: 100, label: "Riego", dataKey: "irrigation" },
    { date: "2026-06-02", value: 200, label: "Cosecha", dataKey: "harvest" },
    { date: "2026-06-03", value: 50, label: "Riego", dataKey: "irrigation" },
  ]

  const txResults = [
    transactionsResult("2025-10-01", "2026-06-08", categoricalRows),
  ]

  const validated = validateDashboardCells(financeCells, txResults)
  assert.equal(validated.find((c) => c.slot === "top_b")?.kind, "donut")

  const nonCategorical = validateDashboardCells(financeCells, [
    transactionsResult("2026-06-08", "2026-06-08", [
      { date: "2026-06-08", value: 42, label: "Total", dataKey: "total" },
    ]),
  ])
  assert.equal(nonCategorical.find((c) => c.slot === "top_b")?.kind, "empty")

  const builtFinance = buildDashboardCells(financeCells, txResults, "range")
  assert.equal(builtFinance.top_a.kind, "kpi")
  assert.equal(builtFinance.top_b.kind, "donut")
  assert.equal(builtFinance.main.kind, "line")
  assert.equal(builtFinance.detail.kind, "table")

  const climateResults = [
    weatherResult("2025-10-01", "2026-06-08", "temperature"),
    weatherResult("2025-10-01", "2026-06-08", "rainfall"),
  ]

  const builtClimate = buildDashboardCells(climateCells, climateResults, "range")
  assert.equal(builtClimate.top_b.kind, "empty")
  assert.equal(builtClimate.main.kind, "line")

  const inferredClimate = inferDashboardCells(
    climateResults,
    "range",
    "evolución climática esta campaña"
  )
  assert.equal(inferredClimate.length, 6)
  assert.equal(inferredClimate.find((c) => c.slot === "top_b")?.kind, "empty")

  const inferredFinance = inferDashboardCells(
    txResults,
    "range",
    "datos de esta campaña"
  )
  assert.equal(inferredFinance.find((c) => c.slot === "top_a")?.kind, "kpi")

  const marketResults: QueryResult[] = [
    {
      query: {
        source: "marketPrices",
        grade: "virgen",
        from: "2025-10-01",
        to: "2026-06-08",
      },
      label: "Aceite Virgen",
      rows: [
        { date: "2026-01-01", value: 4.6, label: "Aceite Virgen", dataKey: "virgen_q0" },
        { date: "2026-01-02", value: 4.7, label: "Aceite Virgen", dataKey: "virgen_q0" },
      ],
    },
    {
      query: {
        source: "marketPrices",
        grade: "virgen_extra",
        from: "2025-10-01",
        to: "2026-06-08",
      },
      label: "Aceite Virgen Extra",
      rows: [
        {
          date: "2026-01-01",
          value: 5.4,
          label: "Aceite Virgen Extra",
          dataKey: "virgen_extra_q1",
        },
        {
          date: "2026-01-02",
          value: 5.5,
          label: "Aceite Virgen Extra",
          dataKey: "virgen_extra_q1",
        },
      ],
    },
  ]

  const mappedCells = widgetSpecsToDashboardCells(
    [
      {
        type: "bar_chart",
        title: "Precios Aceite Virgen y Virgen Extra — Historico",
      },
    ],
    marketResults,
    { message: "Comparativa histórica de precios de aceite." }
  )

  const mainCell = mappedCells.find((cell) => cell.slot === "main")
  assert.equal(mainCell?.kind, "bar")
  if (mainCell?.kind === "bar") {
    assert.deepEqual(mainCell.queryIndices, [0, 1])
  }

  const builtMarket = buildDashboardCells(mappedCells, marketResults, "range")
  assert.equal(builtMarket.main.kind, "bar")
  if (builtMarket.main.kind === "bar") {
    assert.ok(builtMarket.main.view.series.length >= 2)
  }

  console.log("dashboard-cells tests passed")
}

runTests()
