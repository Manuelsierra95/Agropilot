import { tasks } from "@workspace/db/schemas"
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod"
import z from "zod"

export const taskTypeSchema = z.enum(["manual", "recommended", "automated"])

export const taskCategorySchema = z.enum([
  "irrigation",
  "fertilization",
  "treatment",
  "harvest",
  "inspection",
])

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

export const taskCreateInputSchema = z.object({
  title: z.string().min(1),
  category: taskCategorySchema,
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Fecha de inicio ISO YYYY-MM-DD"),
  description: z.string().optional(),
  parcelId: z.string().optional(),
  priority: z.number().int().min(0).max(3).optional(),
})

export type TaskCreateInput = z.infer<typeof taskCreateInputSchema>

export type TaskType = z.infer<typeof taskTypeSchema>
export type TaskCategory = z.infer<typeof taskCategorySchema>
export type TaskStatus = z.infer<typeof taskStatusSchema>
export type TaskSource = z.infer<typeof taskSourceSchema>
export type TaskSelect = ReturnType<typeof taskSelectSchema.parse>
export type TaskInsert = ReturnType<typeof taskInsertSchema.parse>
export type TaskUpdate = ReturnType<typeof taskUpdateSchema.parse>

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  irrigation: "Riego",
  fertilization: "Fertilización",
  treatment: "Tratamiento",
  harvest: "Cosecha",
  inspection: "Inspección",
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  done: "Hecha",
  skipped: "Omitida",
}
