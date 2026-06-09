import type { QueryResult } from "../schemas/chart-action-schema"
import type { CellSpec } from "../schemas/dashboard-grid-schema"
import { daysBetween } from "./query-result-helpers"

function isTimeSeriesResult(result: QueryResult): boolean {
  const { query } = result
  if (result.error || result.rows.length === 0) return false
  if (query.source === "marketPrices" || query.source === "parcelWeather") {
    return true
  }
  if (query.source === "parcelCashflow" || query.source === "transactions") {
    return daysBetween(query.from, query.to) > 1
  }
  return result.rows.length > 1
}

function isCategoricalResult(result: QueryResult): boolean {
  if (result.error || result.rows.length === 0) return false
  if (result.query.source === "tasks") return true
  const keys = new Set(result.rows.map((row) => row.dataKey))
  return keys.size > 1
}

function getResult(
  results: QueryResult[],
  index: number
): QueryResult | undefined {
  return results[index]
}

export function validateDashboardCell(
  spec: CellSpec,
  results: QueryResult[]
): CellSpec {
  if (spec.kind === "empty" || spec.kind === "alert") {
    return spec
  }

  const result = getResult(results, spec.queryIndex)
  if (!result || result.error || result.rows.length === 0) {
    return { slot: spec.slot, kind: "empty" }
  }

  if (spec.kind === "donut" && !isCategoricalResult(result)) {
    return { slot: spec.slot, kind: "empty" }
  }

  if (
    (spec.kind === "line" || spec.kind === "bar") &&
    !isTimeSeriesResult(result)
  ) {
    if (result.rows.length > 0) {
      return {
        slot: spec.slot,
        kind: "table",
        title: spec.title,
        queryIndex: spec.queryIndex,
      }
    }
    return { slot: spec.slot, kind: "empty" }
  }

  return spec
}

export function validateDashboardCells(
  cells: CellSpec[],
  results: QueryResult[]
): CellSpec[] {
  return cells.map((cell) => validateDashboardCell(cell, results))
}
