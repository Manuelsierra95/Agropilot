import z from "zod"

import {
  transactionCategorySchema,
  transactionFlowSchema,
  transactionSelectSchema,
} from "./finance"
import { marketPriceSelectSchema, oilGradeSchema } from "./market"
import { parcelCashflowDailySelectSchema } from "./parcel-cashflow"
import {
  parcelWeatherDataSchema,
  parcelWeatherMetricSchema,
} from "./parcel-weather"
import { taskCategorySchema, taskSelectSchema, taskStatusSchema } from "./tasks"

export { gradeLabel, oilGradeSchema, type OilGrade } from "./market"
export {
  metricLabel,
  parcelWeatherMetricSchema,
  type ParcelWeatherMetric,
} from "./parcel-weather"

const isoDateSchema = z
  .string()
  .date()
  .describe("Fecha ISO YYYY-MM-DD")

export const marketPricesQuerySchema = z.object({
  source: z.literal("marketPrices"),
  grade: oilGradeSchema.describe("Calidad del aceite de oliva"),
  from: isoDateSchema,
  to: isoDateSchema,
})

export const transactionsQuerySchema = z.object({
  source: z.literal("transactions"),
  flow: transactionFlowSchema
    .optional()
    .describe("Filtrar ingresos o gastos; omitir para ambos"),
  category: transactionCategorySchema
    .optional()
    .describe("Categoría del movimiento financiero"),
  campaignId: z
    .string()
    .optional()
    .describe("ID de campaña; omitir para la campaña activa"),
  from: isoDateSchema,
  to: isoDateSchema,
})

export const parcelCashflowQuerySchema = z.object({
  source: z.literal("parcelCashflow"),
  parcelId: z
    .string()
    .optional()
    .describe("ID de parcela; omitir para la parcela por defecto"),
  from: isoDateSchema,
  to: isoDateSchema,
})

export const parcelWeatherQuerySchema = z.object({
  source: z.literal("parcelWeather"),
  parcelId: z
    .string()
    .optional()
    .describe("ID de parcela; omitir para la parcela por defecto"),
  metric: parcelWeatherMetricSchema.describe(
    "Métrica climática: humedad del suelo, precipitación o temperatura"
  ),
  from: isoDateSchema,
  to: isoDateSchema,
})

export const tasksQuerySchema = z.object({
  source: z.literal("tasks"),
  status: taskStatusSchema
    .optional()
    .describe("Estado de la tarea"),
  category: taskCategorySchema
    .optional()
    .describe("Categoría de la tarea"),
  from: isoDateSchema,
  to: isoDateSchema,
})

export const querySpecSchema = z.discriminatedUnion("source", [
  marketPricesQuerySchema,
  transactionsQuerySchema,
  parcelCashflowQuerySchema,
  parcelWeatherQuerySchema,
  tasksQuerySchema,
])

export const chartQueryInputSchema = z.object({
  title: z.string().min(1),
  queries: z.array(querySpecSchema).min(1).max(5),
})

export type QuerySpec = z.infer<typeof querySpecSchema>
export type ChartQueryInput = z.infer<typeof chartQueryInputSchema>

export const COPILOT_QUERY_RESULT_ROW_FIELDS = [
  "date",
  "value",
  "label",
  "dataKey",
] as const

export const COPILOT_DATA_SOURCE_RESPONSE_SCHEMAS = {
  marketPrices: marketPriceSelectSchema,
  transactions: transactionSelectSchema,
  parcelCashflow: parcelCashflowDailySelectSchema,
  parcelWeather: parcelWeatherDataSchema,
  tasks: taskSelectSchema,
} as const

export const COPILOT_DATA_SOURCES = {
  marketPrices: {
    label: "Precios de mercado",
    description:
      "Precios diarios del aceite de oliva por calidad (virgen extra, virgen, lampante).",
    normalizedShape: "time_series" as const,
    responseFields: ["date", "price", "grade", "unit", "currency"],
  },
  transactions: {
    label: "Transacciones financieras",
    description:
      "Movimientos de ingresos y gastos de la explotación, filtrables por categoría y campaña.",
    normalizedShape: "time_series_or_categorical" as const,
    responseFields: [
      "date",
      "flow",
      "category",
      "amount",
      "concept",
      "campaignId",
    ],
  },
  parcelCashflow: {
    label: "Flujo de caja por parcela",
    description:
      "Ingresos y gastos diarios agregados por parcela en un rango de fechas.",
    normalizedShape: "multi_series" as const,
    responseFields: ["date", "income", "expense", "parcelId", "campaignId"],
  },
  parcelWeather: {
    label: "Clima de parcela",
    description:
      "Serie diaria de humedad del suelo, precipitación y temperatura por parcela.",
    normalizedShape: "time_series" as const,
    responseFields: ["daily.date", "daily.soilMoisture", "daily.rainfall", "daily.temperature"],
  },
  tasks: {
    label: "Tareas agrícolas",
    description:
      "Tareas planificadas o realizadas, filtrables por estado y categoría.",
    normalizedShape: "categorical" as const,
    responseFields: [
      "title",
      "category",
      "status",
      "startDate",
      "priority",
      "parcelId",
    ],
  },
} as const satisfies Record<
  QuerySpec["source"],
  {
    label: string
    description: string
    normalizedShape: string
    responseFields: readonly string[]
  }
>
