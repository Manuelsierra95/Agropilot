import { tasks } from "@workspace/db/schemas"
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod"
import z from "zod"

export const taskTypeSchema = z.enum(["manual", "recommended", "automated"])

export const PRESET_CATEGORIES = [
  "irrigation",
  "fertilization",
  "treatment",
  "harvest",
  "inspection",
] as const

export type PresetCategory = (typeof PRESET_CATEGORIES)[number]
export type TaskCategory = string

export const presetCategorySchema = z.enum(PRESET_CATEGORIES)
export const taskCategorySchema = z.string().min(1)

export const taskStatusSchema = z.enum([
  "pending",
  "in_progress",
  "done",
  "skipped",
])

export const taskSourceSchema = z.enum([
  "manual",
  "weather",
  "risk_engine",
  "market",
  "sensor",
])

export const taskSelectSchema = createSelectSchema(tasks)
export const taskInsertSchema = createInsertSchema(tasks)
export const taskUpdateSchema = createUpdateSchema(tasks)

const taskDateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .describe("Fecha ISO YYYY-MM-DD")

/** YYYY-MM-DD or ISO datetime (for calendar drag with time). */
export const taskScheduleInputSchema = z.union([
  taskDateOnlySchema,
  z.string().datetime(),
])

export const taskCreateInputSchema = z.object({
  title: z.string().min(1),
  category: taskCategorySchema,
  startDate: taskDateOnlySchema.describe("Fecha de inicio ISO YYYY-MM-DD"),
  description: z.string().optional(),
  parcelId: z.string().optional(),
  priority: z.number().int().min(0).max(3).optional(),
  recommendationId: z.string().uuid().optional(),
})

export const taskUpdateInputSchema = z.object({
  title: z.string().min(1).optional(),
  category: taskCategorySchema.optional(),
  startDate: taskScheduleInputSchema.optional(),
  endDate: taskScheduleInputSchema.nullable().optional(),
  description: z.string().nullable().optional(),
  parcelId: z.string().nullable().optional(),
  priority: z.number().int().min(0).max(3).optional(),
  status: taskStatusSchema.optional(),
})

export type TaskCreateInput = z.infer<typeof taskCreateInputSchema>
export type TaskUpdateInput = z.infer<typeof taskUpdateInputSchema>

export type TaskType = z.infer<typeof taskTypeSchema>
export type TaskStatus = z.infer<typeof taskStatusSchema>
export type TaskSource = z.infer<typeof taskSourceSchema>
export type TaskSelect = ReturnType<typeof taskSelectSchema.parse>
export type TaskInsert = ReturnType<typeof taskInsertSchema.parse>
export type TaskUpdate = ReturnType<typeof taskUpdateSchema.parse>

const PRESET_CATEGORY_LABELS: Record<PresetCategory, string> = {
  irrigation: "Riego",
  fertilization: "Fertilización",
  treatment: "Tratamiento",
  harvest: "Cosecha",
  inspection: "Inspección",
}

export function getCategoryLabel(category: string): string {
  return PRESET_CATEGORY_LABELS[category as PresetCategory] ?? category
}

// Deprecated: prefer `getCategoryLabel()` for runtime labels.
// Kept for backwards compatibility in places that expect a static map.
export const TASK_CATEGORY_LABELS: Record<PresetCategory, string> =
  PRESET_CATEGORY_LABELS

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  done: "Hecha",
  skipped: "Omitida",
}
