import {
  oilGradeSchema,
  parcelWeatherMetricSchema,
  taskCategorySchema,
  taskCreateInputSchema,
  taskStatusSchema,
  transactionCategorySchema,
  transactionFlowSchema,
} from "@workspace/schemas"
import { tool } from "ai"
import z from "zod"

import type { QueryResult } from "../schemas/query-result"
import type { CopilotContext, ExecuteQueryFn } from "../types/execute-query"

const isoDateSchema = z
  .string()
  .date()
  .describe("Fecha ISO YYYY-MM-DD")

function serializeQueryResult(result: QueryResult) {
  if (result.error === "not_implemented") {
    return {
      label: result.label,
      error: "not_implemented",
      rows: [],
    }
  }

  return {
    label: result.label,
    rows: result.rows,
  }
}

export function createCopilotTools(
  executeQuery: ExecuteQueryFn,
  ctx: CopilotContext
) {
  let queryIndex = 0

  const runQuery = async (
    query: Parameters<ExecuteQueryFn>[0]
  ): Promise<ReturnType<typeof serializeQueryResult>> => {
    const index = queryIndex++
    const result = await executeQuery(query, index, ctx)
    return serializeQueryResult(result)
  }

  return {
    query_transactions: tool({
      description:
        "Consulta movimientos financieros (ingresos/gastos) de la explotación.",
      inputSchema: z.object({
        from: isoDateSchema,
        to: isoDateSchema,
        flow: transactionFlowSchema
          .optional()
          .describe("income o expense; omitir para ambos"),
        category: transactionCategorySchema.optional(),
      }),
      execute: async ({ from, to, flow, category }) =>
        runQuery({
          source: "transactions",
          from,
          to,
          flow,
          category,
        }),
    }),

    query_market_prices: tool({
      description: "Consulta precios diarios del aceite de oliva por calidad.",
      inputSchema: z.object({
        grade: oilGradeSchema,
        from: isoDateSchema,
        to: isoDateSchema,
      }),
      execute: async ({ grade, from, to }) =>
        runQuery({ source: "marketPrices", grade, from, to }),
    }),

    query_parcel_weather: tool({
      description:
        "Consulta datos climáticos diarios de una parcela (temperatura, lluvia, humedad).",
      inputSchema: z.object({
        metric: parcelWeatherMetricSchema,
        from: isoDateSchema,
        to: isoDateSchema,
        parcelId: z.string().optional().describe("ID de parcela"),
      }),
      execute: async ({ metric, from, to, parcelId }) =>
        runQuery({
          source: "parcelWeather",
          metric,
          from,
          to,
          parcelId,
        }),
    }),

    query_parcel_cashflow: tool({
      description: "Consulta ingresos y gastos diarios por parcela.",
      inputSchema: z.object({
        from: isoDateSchema,
        to: isoDateSchema,
        parcelId: z.string().optional().describe("ID de parcela"),
      }),
      execute: async ({ from, to, parcelId }) =>
        runQuery({
          source: "parcelCashflow",
          from,
          to,
          parcelId,
        }),
    }),

    query_tasks: tool({
      description: "Consulta tareas agrícolas planificadas o realizadas.",
      inputSchema: z.object({
        from: isoDateSchema,
        to: isoDateSchema,
        status: taskStatusSchema.optional(),
        category: taskCategorySchema.optional(),
      }),
      execute: async ({ from, to, status, category }) =>
        runQuery({
          source: "tasks",
          from,
          to,
          status,
          category,
        }),
    }),

    show_task_form: tool({
      description:
        "Muestra un formulario pre-rellenado para que el usuario cree una tarea agrícola.",
      inputSchema: taskCreateInputSchema,
      execute: async (input) => input,
    }),
  }
}
