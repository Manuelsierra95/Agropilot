import { z } from "zod"

import type { ChartView } from "./chart-action-schema"

export const widgetTypeSchema = z.enum([
  "kpi",
  "table",
  "line_chart",
  "bar_chart",
  "alert",
])

export const alertSeveritySchema = z.enum(["low", "medium", "high"])

export const kpiWidgetSpecSchema = z.object({
  type: z.literal("kpi"),
  title: z.string().min(1),
  queryIndex: z.number().int().min(0).optional(),
})

export const tableWidgetSpecSchema = z.object({
  type: z.literal("table"),
  title: z.string().min(1).optional(),
  queryIndex: z.number().int().min(0).optional(),
})

export const lineChartWidgetSpecSchema = z.object({
  type: z.literal("line_chart"),
  title: z.string().min(1),
  queryIndices: z.array(z.number().int().min(0)).optional(),
})

export const barChartWidgetSpecSchema = z.object({
  type: z.literal("bar_chart"),
  title: z.string().min(1),
  queryIndices: z.array(z.number().int().min(0)).optional(),
})

export const alertWidgetSpecSchema = z.object({
  type: z.literal("alert"),
  title: z.string().min(1),
  severity: alertSeveritySchema,
  message: z.string().min(1),
})

export const widgetSpecSchema = z.discriminatedUnion("type", [
  kpiWidgetSpecSchema,
  tableWidgetSpecSchema,
  lineChartWidgetSpecSchema,
  barChartWidgetSpecSchema,
  alertWidgetSpecSchema,
])

export type WidgetType = z.infer<typeof widgetTypeSchema>
export type AlertSeverity = z.infer<typeof alertSeveritySchema>
export type WidgetSpec = z.infer<typeof widgetSpecSchema>

export type KpiWidget = {
  type: "kpi"
  title: string
  value: string
  unit?: string
  delta?: string
}

export type TableColumn = {
  key: string
  label: string
}

export type TableWidget = {
  type: "table"
  title?: string
  columns: TableColumn[]
  rows: Record<string, string | number>[]
}

export type ChartWidget = {
  type: "line_chart" | "bar_chart"
  view: ChartView
}

export type AlertWidget = {
  type: "alert"
  title: string
  severity: AlertSeverity
  message: string
}

export type Widget = KpiWidget | TableWidget | ChartWidget | AlertWidget

export type DataPresentation = {
  message: string
  widgets: Widget[]
}
