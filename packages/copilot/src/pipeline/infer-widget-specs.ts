import type { QueryResult } from "../schemas/chart-action-schema"
import type { AnswerFocus } from "../schemas/copilot-intent-schema"
import { COPILOT_REFERENCE_DATE } from "../schemas/copilot-intent-schema"
import {
  defaultResultTitle,
  daysBetween,
  totalRowCount,
} from "./query-result-helpers"
import { isMultiRiskAnalysis } from "./risk-question-helpers"
import type { WidgetSpec } from "../schemas/widget-schema"

function isTimeSeriesQuery(result: QueryResult): boolean {
  const { query } = result
  if (query.source === "marketPrices" || query.source === "parcelWeather") {
    return true
  }
  if (query.source === "parcelCashflow" || query.source === "transactions") {
    return daysBetween(query.from, query.to) > 3
  }
  return false
}

function isCategoricalQuery(result: QueryResult): boolean {
  return result.query.source === "tasks"
}

export function inferWidgetSpecs(
  results: QueryResult[],
  focus: AnswerFocus,
  userText: string,
  fallbackTitle?: string
): WidgetSpec[] {
  const title = fallbackTitle ?? defaultResultTitle(results)

  if (isMultiRiskAnalysis(userText)) {
    return [{ type: "bar_chart", title }]
  }

  if (totalRowCount(results) > 5 && results.some((r) => r.rows.length > 5)) {
    return [{ type: "table", title, queryIndex: 0 }]
  }

  if (results.some(isCategoricalQuery)) {
    return [{ type: "bar_chart", title }]
  }

  if (results.some(isTimeSeriesQuery)) {
    return [{ type: "line_chart", title }]
  }

  if (totalRowCount(results) > 5) {
    return [{ type: "table", title, queryIndex: 0 }]
  }

  if (totalRowCount(results) > 1) {
    return [{ type: "line_chart", title }]
  }

  return [{ type: "table", title, queryIndex: 0 }]
}

export function isSingleDayFocus(
  focus: AnswerFocus,
  results: QueryResult[]
): boolean {
  if (focus === "today") return true
  if (results.length === 0) return false
  const query = results[0]!.query
  return query.from === COPILOT_REFERENCE_DATE && query.to === COPILOT_REFERENCE_DATE
}
