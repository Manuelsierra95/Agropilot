import { z } from "zod"

import {
  copilotCreateTaskPayloadSchema,
  TASK_CATEGORY_LABELS,
  taskCategorySchema,
  type CopilotCreateTaskPayload,
  type TaskCategory,
} from "@workspace/schemas"

export { TASK_CATEGORY_LABELS, taskCategorySchema }
export type { TaskCategory }

export const createTaskPayloadSchema = copilotCreateTaskPayloadSchema

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

export type CreateTaskPayload = CopilotCreateTaskPayload
export type CopilotAction = z.infer<typeof copilotActionSchema>
export type ActionIntent = z.infer<typeof actionIntentSchema>
export type CopilotActionType = CopilotAction["action"]
export type CopilotActionPayload = CopilotAction["data"]

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
