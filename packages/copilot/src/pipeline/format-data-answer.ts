import { gradeLabel, metricLabel } from "@workspace/schemas"

import type { QueryResult } from "../schemas/chart-action-schema"
import type { AnswerFocus } from "../schemas/copilot-intent-schema"
import { COPILOT_REFERENCE_DATE } from "../schemas/copilot-intent-schema"
import type { WidgetSpec } from "../schemas/widget-schema"

export type DataAnswerFormatter = (
  focus: AnswerFocus,
  results: QueryResult[]
) => string

/** Phase 2: optional LLM synthesis over fetched data. */
export type SynthesizeDataAnswerWithLlm = (
  focus: AnswerFocus,
  results: QueryResult[],
  userText: string
) => Promise<string>

export const synthesizeDataAnswerWithLlm: SynthesizeDataAnswerWithLlm | null = null

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

function formatWeatherAnswer(
  result: QueryResult,
  focus: AnswerFocus
): string {
  const query = result.query
  if (query.source !== "parcelWeather") return ""

  const row = pickRow(result.rows, focus)
  const parcelName = result.label.split(" — ").at(-1) ?? "la parcela"

  if (!row) {
    return `No tengo datos de ${metricLabel(query.metric).toLowerCase()} para hoy en ${parcelName}.`
  }

  const metric = metricLabel(query.metric)
  const unit =
    query.metric === "temperature"
      ? "°C"
      : query.metric === "rainfall"
        ? " mm"
        : "%"

  if (focus === "range" && result.rows.length > 1) {
    const avg =
      result.rows.reduce((sum, item) => sum + item.value, 0) / result.rows.length
    return `En ${parcelName}, la ${metric.toLowerCase()} media en el período es ${avg.toFixed(1)}${unit}.`
  }

  return `En ${parcelName}, la ${metric.toLowerCase()} de hoy es ${row.value}${unit}.`
}

function formatMarketPriceAnswer(
  result: QueryResult,
  focus: AnswerFocus
): string {
  const query = result.query
  if (query.source !== "marketPrices") return ""

  const row = pickRow(result.rows, focus)
  const label = gradeLabel(query.grade)

  if (!row) {
    return `No tengo precio de ${label} para hoy.`
  }

  return `El precio de ${label} hoy es ${row.value.toFixed(2)} €/kg.`
}

function formatTransactionsAnswer(
  result: QueryResult,
  focus: AnswerFocus
): string {
  if (result.query.source !== "transactions") return ""

  const rows =
    focus === "today"
      ? result.rows.filter((row) => row.date === COPILOT_REFERENCE_DATE)
      : result.rows

  if (rows.length === 0) {
    return "No hay transacciones registradas para hoy."
  }

  const total = rows.reduce((sum, row) => sum + row.value, 0)
  return `Hoy hay ${rows.length} transacción${rows.length === 1 ? "" : "es"} por un total de ${total.toFixed(2)} €.`
}

function formatTasksAnswer(result: QueryResult, focus: AnswerFocus): string {
  if (result.query.source !== "tasks") return ""

  const rows =
    focus === "today"
      ? result.rows.filter((row) => row.date === COPILOT_REFERENCE_DATE)
      : result.rows

  if (rows.length === 0) {
    return "No hay tareas programadas para hoy."
  }

  return `Hoy tienes ${rows.length} tarea${rows.length === 1 ? "" : "s"} en el calendario.`
}

function formatCashflowAnswer(
  result: QueryResult,
  focus: AnswerFocus
): string {
  if (result.query.source !== "parcelCashflow") return ""

  const incomeRows = result.rows.filter((row) => row.dataKey.includes("income"))
  const expenseRows = result.rows.filter((row) =>
    row.dataKey.includes("expense")
  )

  const income = incomeRows.reduce((sum, row) => sum + row.value, 0)
  const expense = expenseRows.reduce((sum, row) => sum + row.value, 0)

  if (focus === "today") {
    const todayIncome = incomeRows
      .filter((row) => row.date === COPILOT_REFERENCE_DATE)
      .reduce((sum, row) => sum + row.value, 0)
    const todayExpense = expenseRows
      .filter((row) => row.date === COPILOT_REFERENCE_DATE)
      .reduce((sum, row) => sum + row.value, 0)

    if (todayIncome === 0 && todayExpense === 0) {
      return "No hay movimientos de caja registrados para hoy."
    }

    return `Hoy: ingresos ${todayIncome.toFixed(2)} € y gastos ${todayExpense.toFixed(2)} €.`
  }

  return `En el período: ingresos ${income.toFixed(2)} € y gastos ${expense.toFixed(2)} €.`
}

function formatSingleResult(result: QueryResult, focus: AnswerFocus): string {
  switch (result.query.source) {
    case "parcelWeather":
      return formatWeatherAnswer(result, focus)
    case "marketPrices":
      return formatMarketPriceAnswer(result, focus)
    case "transactions":
      return formatTransactionsAnswer(result, focus)
    case "tasks":
      return formatTasksAnswer(result, focus)
    case "parcelCashflow":
      return formatCashflowAnswer(result, focus)
  }
}

export const formatDataAnswer: DataAnswerFormatter = (focus, results) => {
  const lines = results
    .map((result) => formatSingleResult(result, focus))
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return "No encontré datos para responder a tu pregunta."
  }

  return lines.join("\n")
}

export function formatChatDataResponse(
  focus: AnswerFocus,
  results: QueryResult[],
  options: {
    llmMessage?: string
    widgetSpecs?: WidgetSpec[]
  } = {}
): string {
  const llmMessage = options.llmMessage?.trim()
  if (llmMessage && llmMessage.length > 0) {
    return llmMessage
  }

  const alertSpec = options.widgetSpecs?.find((spec) => spec.type === "alert")
  if (alertSpec?.type === "alert") {
    return alertSpec.message
  }

  return formatDataAnswer(focus, results)
}
