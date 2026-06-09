import { z } from "zod"

import type { ChartView } from "./chart-action-schema"
import { alertSeveritySchema } from "./widget-schema"

export const DASHBOARD_SLOT_IDS = [
  "top_a",
  "top_b",
  "top_c",
  "main",
  "secondary",
  "detail",
] as const

export const dashboardSlotIdSchema = z.enum(DASHBOARD_SLOT_IDS)

export const cellKindSchema = z.enum([
  "empty",
  "kpi",
  "donut",
  "alert",
  "line",
  "bar",
  "table",
])

export const emptyCellSpecSchema = z.object({
  slot: dashboardSlotIdSchema,
  kind: z.literal("empty"),
})

export const kpiCellSpecSchema = z.object({
  slot: dashboardSlotIdSchema,
  kind: z.literal("kpi"),
  title: z.string().min(1),
  queryIndex: z.number().int().min(0),
})

export const donutCellSpecSchema = z.object({
  slot: dashboardSlotIdSchema,
  kind: z.literal("donut"),
  title: z.string().min(1),
  queryIndex: z.number().int().min(0),
})

export const alertCellSpecSchema = z.object({
  slot: dashboardSlotIdSchema,
  kind: z.literal("alert"),
  title: z.string().min(1),
  severity: alertSeveritySchema,
  message: z.string().min(1),
  queryIndex: z.number().int().min(0).optional(),
})

export const lineCellSpecSchema = z.object({
  slot: dashboardSlotIdSchema,
  kind: z.literal("line"),
  title: z.string().min(1),
  queryIndex: z.number().int().min(0),
  queryIndices: z.array(z.number().int().min(0)).optional(),
})

export const barCellSpecSchema = z.object({
  slot: dashboardSlotIdSchema,
  kind: z.literal("bar"),
  title: z.string().min(1),
  queryIndex: z.number().int().min(0),
  queryIndices: z.array(z.number().int().min(0)).optional(),
})

export const tableCellSpecSchema = z.object({
  slot: dashboardSlotIdSchema,
  kind: z.literal("table"),
  title: z.string().min(1).optional(),
  queryIndex: z.number().int().min(0),
})

export const cellSpecSchema = z.discriminatedUnion("kind", [
  emptyCellSpecSchema,
  kpiCellSpecSchema,
  donutCellSpecSchema,
  alertCellSpecSchema,
  lineCellSpecSchema,
  barCellSpecSchema,
  tableCellSpecSchema,
])

export const dashboardCellsSchema = z
  .array(cellSpecSchema)
  .length(6)
  .superRefine((cells, ctx) => {
    const slots = cells.map((cell) => cell.slot)
    const unique = new Set(slots)
    if (unique.size !== DASHBOARD_SLOT_IDS.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Each dashboard slot must appear exactly once",
      })
    }
    for (const slot of DASHBOARD_SLOT_IDS) {
      if (!unique.has(slot)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Missing dashboard slot: ${slot}`,
        })
      }
    }
  })

export type DashboardSlotId = z.infer<typeof dashboardSlotIdSchema>
export type CellKind = z.infer<typeof cellKindSchema>
export type CellSpec = z.infer<typeof cellSpecSchema>

export type DonutSlice = {
  category: string
  amount: number
  fill: string
}

export type EmptyCell = { kind: "empty" }

export type KpiCell = {
  kind: "kpi"
  title: string
  value: string
  unit?: string
  delta?: string
}

export type DonutCell = {
  kind: "donut"
  title: string
  slices: DonutSlice[]
}

export type AlertCell = {
  kind: "alert"
  title: string
  severity: z.infer<typeof alertSeveritySchema>
  message: string
}

export type LineCell = {
  kind: "line"
  title: string
  view: ChartView
}

export type BarCell = {
  kind: "bar"
  title: string
  view: ChartView
}

export type TableCell = {
  kind: "table"
  title?: string
  columns: { key: string; label: string }[]
  rows: Record<string, string | number>[]
}

export type ResolvedCell =
  | EmptyCell
  | KpiCell
  | DonutCell
  | AlertCell
  | LineCell
  | BarCell
  | TableCell

export type DashboardCellsPayload = Record<DashboardSlotId, ResolvedCell>

export function createEmptyDashboardCells(): DashboardCellsPayload {
  return {
    top_a: { kind: "empty" },
    top_b: { kind: "empty" },
    top_c: { kind: "empty" },
    main: { kind: "empty" },
    secondary: { kind: "empty" },
    detail: { kind: "empty" },
  }
}
