import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai"

import type {
  ProcessStep,
  ProcessStepStatus,
  TaskProgressData,
  TaskProgressPhase,
} from "../schemas/chat-types"
import type { QueryResult } from "../schemas/chart-action-schema"
import {
  COPILOT_OUT_OF_SCOPE_MESSAGE,
  normalizeAnswerFocus,
  normalizeToDataIntent,
} from "../schemas/copilot-intent-schema"
import type { CopilotContext, ExecuteQueryFn } from "../types/execute-query"
import { buildDashboardCells } from "./build-dashboard-cells"
import { formatChatDataResponse } from "./format-data-answer"
import { widgetSpecsToDashboardCells } from "./widget-specs-to-dashboard-cells"
import { getLastUserText } from "./get-last-user-text"
import { resolvePresentationChannel } from "./resolve-presentation-channel"
import { resolveCopilotIntent } from "./resolve-copilot-intent"
import {
  createInitialSteps,
  createPendingTaskProgress,
} from "./task-progress-steps"
import { asTextStreamWriter, streamAssistantText } from "./stream-text"

const LOG_PREFIX = "[copilot-pipeline]"

export type StreamCopilotDeps = {
  executeQuery: ExecuteQueryFn
  ctx: CopilotContext
}

function setStepStatus(
  steps: ProcessStep[],
  stepId: string,
  status: ProcessStepStatus,
  badge?: string
): ProcessStep[] {
  return steps.map((step) =>
    step.id === stepId ? { ...step, status, badge: badge ?? step.badge } : step
  )
}

function skipRemainingDataSteps(steps: ProcessStep[]): ProcessStep[] {
  return steps.map((step) =>
    step.status === "pending" ? { ...step, status: "skipped" as const } : step
  )
}

function buildProgress(
  title: string,
  statusLine: string,
  steps: ProcessStep[],
  phase: TaskProgressPhase,
  subtitle?: string
): TaskProgressData {
  return {
    title,
    subtitle:
      subtitle ??
      (phase === "complete"
        ? "Listo"
        : phase === "error"
          ? "Error"
          : "Generando…"),
    statusLine,
    steps,
    phase,
  }
}

function callsLabel(count: number) {
  return count === 1 ? "1 call" : `${count} calls`
}

function hasNotImplementedResults(results: QueryResult[]): boolean {
  return results.some((result) => result.error === "not_implemented")
}

function notImplementedMessage(results: QueryResult[]): string {
  const sources = [
    ...new Set(
      results
        .filter((r) => r.error === "not_implemented")
        .map((r) => r.query.source)
    ),
  ]
  if (sources.length === 0) {
    return "Esta fuente de datos aún no está disponible."
  }
  return `Estas fuentes de datos aún no están disponibles: ${sources.join(", ")}.`
}

export function streamCopilotResponse(
  messages: UIMessage[],
  deps: StreamCopilotDeps
): Response {
  const { executeQuery, ctx } = deps

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer: rawWriter }) => {
      const writer = asTextStreamWriter(rawWriter)
      const userText = getLastUserText(messages)
      console.log(`${LOG_PREFIX} start`, { userText })

      let steps = createInitialSteps()
      let title = "Copilot"
      let statusLine = "Analizando petición…"

      const writeProgress = (
        phase: TaskProgressPhase,
        subtitle?: string,
        nextTitle?: string,
        nextStatusLine?: string
      ) => {
        if (nextTitle) title = nextTitle
        if (nextStatusLine) statusLine = nextStatusLine
        rawWriter.write({
          type: "data-task-progress",
          id: "task-progress",
          data: buildProgress(title, statusLine, steps, phase, subtitle),
        })
      }

      const writeDashboardLoading = () => {
        rawWriter.write({
          type: "data-dashboard-loading",
          id: "dashboard-loading",
          data: {},
        })
      }

      const initialProgress = createPendingTaskProgress()
      steps = setStepStatus(steps, "llm_queries", "running")
      writeProgress(
        "running",
        "Generando…",
        initialProgress.title,
        initialProgress.statusLine
      )

      const resolved = await resolveCopilotIntent(messages)
      console.log(`${LOG_PREFIX} resolve result`, resolved)

      steps = setStepStatus(steps, "llm_queries", "done")
      writeProgress("running", "Intención resuelta", title, "Procesando…")

      if (!resolved.ok) {
        steps = skipRemainingDataSteps(steps)
        const fallbackMessage =
          resolved.reason === "llm_error"
            ? "No pude procesar tu mensaje en este momento. Inténtalo de nuevo en unos segundos."
            : "No he podido interpretar tu petición. Puedes preguntarme algo concreto o pedir un gráfico."

        writeProgress(
          "error",
          "No se pudo completar",
          title,
          "Error al interpretar"
        )
        streamAssistantText(writer, fallbackMessage)
        rawWriter.write({ type: "finish", finishReason: "stop" })
        return
      }

      const { intent } = resolved

      if (intent.intent === "out_of_scope") {
        console.log(`${LOG_PREFIX} mode out_of_scope`)
        steps = skipRemainingDataSteps(steps)
        writeProgress("running", "Consulta fuera de ámbito", title, "Respondiendo…")
        streamAssistantText(writer, COPILOT_OUT_OF_SCOPE_MESSAGE)
        writeProgress("complete", "Listo", title, "Respuesta lista")
        rawWriter.write({ type: "finish", finishReason: "stop" })
        return
      }

      if (intent.intent === "chat") {
        console.log(`${LOG_PREFIX} mode chat`)
        steps = skipRemainingDataSteps(steps)
        writeProgress("running", "Redactando respuesta…", title, "Respondiendo…")
        streamAssistantText(writer, intent.message)
        writeProgress("complete", "Listo", title, "Respuesta lista")
        rawWriter.write({ type: "finish", finishReason: "stop" })
        return
      }

      if (intent.intent === "action") {
        console.log(`${LOG_PREFIX} mode action`, intent)
        const confirmationId = crypto.randomUUID()
        steps = skipRemainingDataSteps(steps)
        writeProgress(
          "running",
          "Preparando acción…",
          "Acción propuesta",
          "Revisa y confirma"
        )
        streamAssistantText(writer, intent.message)
        rawWriter.write({
          type: "data-action-confirmation",
          id: confirmationId,
          data: {
            id: confirmationId,
            action: intent.action,
            data: intent.data,
            status: "pending",
          },
        })
        writeProgress("complete", "Listo", "Acción propuesta", "Pendiente de confirmación")
        rawWriter.write({ type: "finish", finishReason: "stop" })
        return
      }

      if (intent.intent === "dashboard") {
        console.log(`${LOG_PREFIX} mode dashboard`, intent)
        const focus = normalizeAnswerFocus(intent.focus)
        title = intent.message.slice(0, 48) || "Dashboard"
        statusLine = `Preparando ${intent.queries.length} consulta${intent.queries.length === 1 ? "" : "s"}…`

        writeDashboardLoading()

        steps = setStepStatus(steps, "fetching_data", "running")
        writeProgress("running", "Obteniendo datos…", title, statusLine)

        const queryResults = await Promise.all(
          intent.queries.map((query, index) => executeQuery(query, index, ctx))
        )

        steps = setStepStatus(
          steps,
          "fetching_data",
          "done",
          callsLabel(queryResults.length)
        )
        steps = setStepStatus(steps, "processing_results", "running")
        writeProgress("running", "Procesando datos…", title, statusLine)

        const cells = buildDashboardCells(intent.cells, queryResults, focus, {
          userText,
        })

        steps = setStepStatus(steps, "processing_results", "done")
        steps = setStepStatus(steps, "building_widgets", "running")
        writeProgress("running", "Preparando visualización…", title, statusLine)

        steps = setStepStatus(steps, "building_widgets", "done")
        steps = setStepStatus(steps, "updating_view", "running")
        writeProgress("running", "Aplicando vista…", title, "Actualizando vista…")

        rawWriter.write({
          type: "data-dashboard-cells",
          id: "dashboard-cells",
          data: { cells },
        })

        let responseMessage = intent.message
        if (hasNotImplementedResults(queryResults)) {
          responseMessage = `${intent.message}\n\n${notImplementedMessage(queryResults)}`
        }

        streamAssistantText(writer, responseMessage)
        steps = setStepStatus(steps, "updating_view", "done")
        writeProgress("complete", "Listo", title, "Vista actualizada")
        rawWriter.write({ type: "finish", finishReason: "stop" })
        return
      }

      const dataIntent = normalizeToDataIntent(intent)
      if (!dataIntent) {
        steps = skipRemainingDataSteps(steps)
        writeProgress("error", "Error", title, "Sin visualización")
        streamAssistantText(writer, "No he podido preparar la visualización.")
        rawWriter.write({ type: "finish", finishReason: "stop" })
        return
      }

      console.log(`${LOG_PREFIX} mode data`, dataIntent)

      const focus = dataIntent.focus ?? "today"
      title =
        dataIntent.widgets[0]?.title ??
        (dataIntent.message.slice(0, 48) || "Consulta de datos")
      statusLine = `Preparando ${dataIntent.queries.length} consulta${dataIntent.queries.length === 1 ? "" : "s"}…`

      if (dataIntent.presentation === "dashboard") {
        writeDashboardLoading()
      }

      steps = setStepStatus(steps, "fetching_data", "running")
      writeProgress("running", "Obteniendo datos…", title, statusLine)

      const queryResults: QueryResult[] = []
      for (const [index, query] of dataIntent.queries.entries()) {
        console.log(`${LOG_PREFIX} fetch query ${index + 1}`, query)
        const result = await executeQuery(query, index, ctx)
        queryResults.push(result)
        console.log(`${LOG_PREFIX} fetch result ${index + 1}`, {
          label: result.label,
          rowCount: result.rows.length,
          error: result.error,
        })
        steps = setStepStatus(
          steps,
          "fetching_data",
          index === dataIntent.queries.length - 1 ? "done" : "running",
          callsLabel(index + 1)
        )
        writeProgress("running", "Obteniendo datos…", title, statusLine)
      }

      if (hasNotImplementedResults(queryResults)) {
        steps = skipRemainingDataSteps(steps)
        writeProgress(
          "error",
          "Fuente no disponible",
          title,
          "Datos no implementados"
        )
        streamAssistantText(writer, notImplementedMessage(queryResults))
        rawWriter.write({ type: "finish", finishReason: "stop" })
        return
      }

      steps = setStepStatus(steps, "processing_results", "running")
      writeProgress("running", "Procesando datos…", title, statusLine)

      const channel = resolvePresentationChannel({
        llmPresentation: dataIntent.presentation,
        widgetSpecs: dataIntent.widgets,
        results: queryResults,
        focus,
        userText,
      })

      console.log(`${LOG_PREFIX} presentation channel`, channel)

      steps = setStepStatus(steps, "processing_results", "done")

      if (channel === "chat") {
        steps = setStepStatus(steps, "building_widgets", "skipped")
        steps = setStepStatus(steps, "updating_view", "skipped")
        writeProgress("running", "Preparando respuesta…", title, "Redactando…")

        const chatMessage = formatChatDataResponse(focus, queryResults, {
          llmMessage: dataIntent.message,
          widgetSpecs: dataIntent.widgets,
        })

        streamAssistantText(writer, chatMessage)
        writeProgress("complete", "Listo", title, "Respuesta lista")
        rawWriter.write({ type: "finish", finishReason: "stop" })
        return
      }

      steps = setStepStatus(steps, "building_widgets", "running")
      writeProgress("running", "Preparando visualización…", title, statusLine)

      let cells
      try {
        const cellSpecs = widgetSpecsToDashboardCells(
          dataIntent.widgets,
          queryResults,
          {
            message: dataIntent.message,
            userText,
            focus,
          }
        )
        cells = buildDashboardCells(cellSpecs, queryResults, focus, {
          userText,
        })
        console.log(`${LOG_PREFIX} dashboard cells ready`, {
          populated: Object.values(cells).filter((cell) => cell.kind !== "empty")
            .length,
        })
      } catch (error) {
        console.error(`${LOG_PREFIX} buildDashboardCells failed`, error)
        steps = setStepStatus(steps, "building_widgets", "skipped")
        steps = setStepStatus(steps, "updating_view", "skipped")
        writeProgress(
          "error",
          "No hay datos para mostrar",
          title,
          "Sin datos en el rango solicitado"
        )
        streamAssistantText(
          writer,
          "No encontré datos para mostrar en el dashboard."
        )
        rawWriter.write({ type: "finish", finishReason: "stop" })
        return
      }

      steps = setStepStatus(steps, "building_widgets", "done")
      steps = setStepStatus(steps, "updating_view", "running")
      writeProgress("running", "Aplicando vista…", title, "Actualizando vista…")

      rawWriter.write({
        type: "data-dashboard-cells",
        id: "dashboard-cells",
        data: { cells },
      })

      streamAssistantText(writer, dataIntent.message)

      steps = setStepStatus(steps, "updating_view", "done")
      writeProgress("complete", "Listo", title, "Vista actualizada")
      rawWriter.write({ type: "finish", finishReason: "stop" })
    },
  })

  const response = createUIMessageStreamResponse({ stream })
  response.headers.set("X-Agropilot-Resolver", "hybrid")
  return response
}
