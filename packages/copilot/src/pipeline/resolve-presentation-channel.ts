import type { QueryResult } from "../schemas/chart-action-schema"
import type { AnswerFocus } from "../schemas/copilot-intent-schema"
import {
  hasMultipleCategories,
  maxSpanDays,
  totalRowCount,
} from "./query-result-helpers"
import { isMultiRiskAnalysis, isSingleRiskQuestion } from "./risk-question-helpers"
import type { WidgetSpec } from "../schemas/widget-schema"

export type PresentationChannel = "chat" | "dashboard"

function heuristicChannel(
  results: QueryResult[],
  focus: AnswerFocus,
  userText: string
): PresentationChannel {
  const rowCount = totalRowCount(results)
  const spanDays = maxSpanDays(results)

  if (isMultiRiskAnalysis(userText)) {
    return "dashboard"
  }

  if (focus === "today" && rowCount <= 1) {
    return "chat"
  }

  if (rowCount <= 1 && spanDays <= 1) {
    return "chat"
  }

  if (isSingleRiskQuestion(userText) && rowCount <= 3) {
    return "chat"
  }

  if (rowCount > 5 || spanDays > 3) {
    return "dashboard"
  }

  if (hasMultipleCategories(results)) {
    return "dashboard"
  }

  return rowCount <= 3 ? "chat" : "dashboard"
}

export function resolvePresentationChannel(input: {
  llmPresentation?: PresentationChannel
  widgetSpecs?: WidgetSpec[]
  results: QueryResult[]
  focus: AnswerFocus
  userText: string
}): PresentationChannel {
  const { llmPresentation, results, focus, userText } = input
  const rowCount = totalRowCount(results)
  const channel = heuristicChannel(results, focus, userText)

  if (channel === "chat") {
    return "chat"
  }

  if (rowCount > 5) {
    return "dashboard"
  }

  if (rowCount >= 4 && rowCount <= 5 && llmPresentation) {
    return llmPresentation
  }

  return "dashboard"
}
