import assert from "node:assert/strict"

import type { QueryResult } from "../schemas/chart-action-schema"
import { resolvePresentationChannel } from "./resolve-presentation-channel"
import {
  isMultiRiskAnalysis,
  isSingleRiskQuestion,
} from "./risk-question-helpers"

function weatherResult(
  from: string,
  to: string,
  rows: QueryResult["rows"]
): QueryResult {
  return {
    query: {
      source: "parcelWeather",
      metric: "temperature",
      from,
      to,
    },
    label: "Temperatura",
    rows,
  }
}

function runTests() {
  const singleToday = weatherResult("2026-06-08", "2026-06-08", [
    { date: "2026-06-08", value: 22, label: "Temp", dataKey: "temperature" },
  ])

  assert.equal(
    resolvePresentationChannel({
      results: [singleToday],
      focus: "today",
      userText: "¿Qué temperatura hace hoy?",
    }),
    "chat"
  )

  const monthRows = Array.from({ length: 30 }, (_, i) => ({
    date: `2026-06-${String(i + 1).padStart(2, "0")}`,
    value: 20 + i * 0.2,
    label: "Temp",
    dataKey: "temperature",
  }))

  assert.equal(
    resolvePresentationChannel({
      results: [weatherResult("2026-06-01", "2026-06-30", monthRows)],
      focus: "range",
      userText: "temperatura este mes",
    }),
    "dashboard"
  )

  assert.equal(
    resolvePresentationChannel({
      results: [singleToday],
      focus: "today",
      userText: "hay riesgo de helada",
    }),
    "chat"
  )

  const weekRows = Array.from({ length: 7 }, (_, i) => ({
    date: `2026-06-0${i + 2}`,
    value: 10 + i,
    label: "Temp",
    dataKey: "temperature",
  }))

  assert.equal(
    resolvePresentationChannel({
      llmPresentation: "dashboard",
      results: [weatherResult("2026-06-02", "2026-06-08", weekRows)],
      focus: "range",
      userText: "qué riesgos climáticos hay esta semana",
    }),
    "dashboard"
  )

  assert.equal(
    resolvePresentationChannel({
      llmPresentation: "dashboard",
      results: [singleToday],
      focus: "today",
      userText: "temperatura hoy",
    }),
    "chat"
  )

  assert.equal(isSingleRiskQuestion("hay riesgo de helada"), true)
  assert.equal(isMultiRiskAnalysis("qué riesgos climáticos hay esta semana"), true)
  assert.equal(isSingleRiskQuestion("qué riesgos climáticos hay esta semana"), false)

  console.log("resolve-presentation-channel: all tests passed")
}

runTests()
