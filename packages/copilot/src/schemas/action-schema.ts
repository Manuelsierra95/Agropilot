import { z } from "zod"

export const taskCategorySchema = z.enum([
  "irrigation",
  "fertilization",
  "treatment",
  "harvest",
  "inspection",
])

export const createTaskPayloadSchema = z.object({
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().optional(),
  parcelId: z.string().optional(),
  category: taskCategorySchema.optional(),
  priority: z.number().int().min(1).max(5).optional(),
})

export const copilotActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create_task"),
    data: createTaskPayloadSchema,
  }),
])

export const actionIntentSchema = z.discriminatedUnion("action", [
  z.object({
    intent: z.literal("action"),
    message: z.string().min(1),
    action: z.literal("create_task"),
    data: createTaskPayloadSchema,
  }),
])

export type TaskCategory = z.infer<typeof taskCategorySchema>
export type CreateTaskPayload = z.infer<typeof createTaskPayloadSchema>
export type CopilotAction = z.infer<typeof copilotActionSchema>
export type ActionIntent = z.infer<typeof actionIntentSchema>
export type CopilotActionType = CopilotAction["action"]
export type CopilotActionPayload = CopilotAction["data"]

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  irrigation: "Riego",
  fertilization: "Fertilización",
  treatment: "Tratamiento",
  harvest: "Cosecha",
  inspection: "Inspección",
}

export const ACTION_UI_CONFIG = {
  create_task: {
    title: "Nueva tarea",
    confirmLabel: "Confirmar",
    cancelLabel: "Cancelar",
  },
} as const satisfies Record<
  CopilotActionType,
  {
    title: string
    confirmLabel: string
    cancelLabel: string
  }
>

export function formatActionDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate

  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function getActionUiConfig(action: CopilotActionType) {
  return ACTION_UI_CONFIG[action]
}
