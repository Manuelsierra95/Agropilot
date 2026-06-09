import type { QueryResult } from "../schemas/chart-action-schema"
import type { AnswerFocus } from "../schemas/copilot-intent-schema"
import {
  DASHBOARD_SLOT_IDS,
  type CellSpec,
  type DashboardSlotId,
} from "../schemas/dashboard-grid-schema"
import { daysBetween } from "./query-result-helpers"

function isClimateQuery(results: QueryResult[]): boolean {
  return results.some((r) => r.query.source === "parcelWeather")
}

function isTimeSeriesResult(result: QueryResult): boolean {
  const { query } = result
  if (query.source === "marketPrices" || query.source === "parcelWeather") {
    return true
  }
  if (query.source === "parcelCashflow" || query.source === "transactions") {
    return daysBetween(query.from, query.to) > 1
  }
  return result.rows.length > 1
}

function emptyCell(slot: DashboardSlotId): CellSpec {
  return { slot, kind: "empty" }
}

export function inferDashboardCells(
  results: QueryResult[],
  _focus: AnswerFocus,
  userText: string
): CellSpec[] {
  const climate = isClimateQuery(results)
  const primary = results[0]
  const secondary = results[1] ?? results[0]
  const tertiary = results[2] ?? results[0]

  if (!primary) {
    return DASHBOARD_SLOT_IDS.map((slot) => emptyCell(slot))
  }

  const title = primary.label

  if (climate) {
    return [
      {
        slot: "top_a",
        kind: "kpi",
        title: "Riesgo climático",
        queryIndex: 0,
      },
      emptyCell("top_b"),
      {
        slot: "top_c",
        kind: "alert",
        title: "Alertas climáticas",
        severity: "medium",
        message: "Revisa la evolución de temperatura y precipitación.",
        queryIndex: 0,
      },
      {
        slot: "main",
        kind: "line",
        title: "Temperatura",
        queryIndex: 0,
      },
      {
        slot: "secondary",
        kind: "bar",
        title: secondary?.label ?? "Precipitación",
        queryIndex: secondary ? Math.min(1, results.length - 1) : 0,
      },
      {
        slot: "detail",
        kind: "table",
        title: "Detalle diario",
        queryIndex: 0,
      },
    ]
  }

  const hasCategories =
    primary.query.source === "tasks" ||
    new Set(primary.rows.map((r) => r.dataKey)).size > 1

  return [
    {
      slot: "top_a",
      kind: "kpi",
      title: title,
      queryIndex: 0,
    },
    hasCategories
      ? {
          slot: "top_b",
          kind: "donut",
          title: "Distribución",
          queryIndex: 0,
        }
      : emptyCell("top_b"),
    {
      slot: "top_c",
      kind: "alert",
      title: "Alertas",
      severity: "low",
      message: userText.slice(0, 120) || "Resumen de campaña disponible.",
      queryIndex: 0,
    },
    {
      slot: "main",
      kind: isTimeSeriesResult(primary) ? "line" : "bar",
      title: primary.label,
      queryIndex: 0,
    },
    {
      slot: "secondary",
      kind: "bar",
      title: secondary?.label ?? "Comparativa",
      queryIndex: secondary ? Math.min(1, results.length - 1) : 0,
    },
    {
      slot: "detail",
      kind: "table",
      title: "Detalle",
      queryIndex: tertiary ? Math.min(2, results.length - 1) : 0,
    },
  ]
}
