import { tool } from "ai"
import { z } from "zod"

export const oilGradeSchema = z.enum(["virgen_extra", "virgen", "lampante"])

export const marketPricesQuerySchema = z.object({
  source: z.literal("marketPrices"),
  grade: oilGradeSchema,
  from: z.string().describe("ISO date YYYY-MM-DD"),
  to: z.string().describe("ISO date YYYY-MM-DD"),
})

export const transactionsQuerySchema = z.object({
  source: z.literal("transactions"),
  flow: z.enum(["income", "expense"]).optional(),
  category: z
    .enum([
      "irrigation",
      "fertilization",
      "treatment",
      "labor",
      "machinery",
      "fuel",
      "harvest",
      "sale",
      "subsidy",
      "other",
    ])
    .optional(),
  from: z.string(),
  to: z.string(),
})

export const parcelCashflowQuerySchema = z.object({
  source: z.literal("parcelCashflow"),
  parcelId: z.string().optional(),
  from: z.string(),
  to: z.string(),
})

export const parcelWeatherQuerySchema = z.object({
  source: z.literal("parcelWeather"),
  parcelId: z.string().optional(),
  metric: z.enum(["soil_moisture", "rainfall", "temperature"]),
  from: z.string(),
  to: z.string(),
})

export const tasksQuerySchema = z.object({
  source: z.literal("tasks"),
  status: z.enum(["pending", "in_progress", "done", "skipped"]).optional(),
  category: z
    .enum(["irrigation", "fertilization", "treatment", "harvest", "inspection"])
    .optional(),
  from: z.string(),
  to: z.string(),
})

export const querySpecSchema = z.discriminatedUnion("source", [
  marketPricesQuerySchema,
  transactionsQuerySchema,
  parcelCashflowQuerySchema,
  parcelWeatherQuerySchema,
  tasksQuerySchema,
])

export const renderChartInputSchema = z.object({
  title: z.string().min(1),
  queries: z.array(querySpecSchema).min(1).max(5),
})

export type OilGrade = z.infer<typeof oilGradeSchema>
export type QuerySpec = z.infer<typeof querySpecSchema>
export type RenderChartInput = z.infer<typeof renderChartInputSchema>

export type ChartSeriesKind = "line" | "area" | "bar"

export type ChartSeriesSpec = {
  dataKey: string
  label: string
  kind: ChartSeriesKind
  color?: string
}

export type ChartView = {
  title: string
  description?: string
  xDataKey: "date"
  rows: Record<string, unknown>[]
  series: ChartSeriesSpec[]
}

export type QueryResultRow = {
  date: string
  value: number
  label: string
  dataKey: string
}

export type QueryResultError = "not_implemented"

export type QueryResult = {
  query: QuerySpec
  rows: QueryResultRow[]
  label: string
  error?: QueryResultError
}

export const renderChartTool = tool({
  description:
    "Traduce la petición del usuario en consultas de datos y un título para el gráfico",
  inputSchema: renderChartInputSchema,
  execute: async (input) => input,
})

export type ChartResolveReason = "no_action" | "invalid_tool" | "llm_error"

export type ChartResolveResult =
  | { ok: true; action: RenderChartInput }
  | { ok: false; reason: ChartResolveReason }

const CHART_SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function gradeLabel(grade: OilGrade): string {
  const labels: Record<OilGrade, string> = {
    virgen_extra: "Aceite Virgen Extra",
    virgen: "Aceite Virgen",
    lampante: "Aceite Lampante",
  }
  return labels[grade]
}

export function metricLabel(metric: "soil_moisture" | "rainfall" | "temperature"): string {
  const labels = {
    soil_moisture: "Humedad del suelo",
    rainfall: "Precipitación",
    temperature: "Temperatura",
  }
  return labels[metric]
}

export function colorForIndex(index: number): string {
  return CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]!
}
