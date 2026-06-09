import z from "zod"

import { taskCategorySchema } from "./tasks"

export const copilotCreateTaskPayloadSchema = z.object({
  title: z.string().min(1).describe("Título de la tarea"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Fecha de inicio ISO YYYY-MM-DD"),
  description: z.string().optional().describe("Descripción opcional"),
  parcelId: z.string().optional().describe("ID de parcela asociada"),
  category: taskCategorySchema
    .optional()
    .describe("Categoría: riego, fertilización, tratamiento, cosecha, inspección"),
  priority: z
    .number()
    .int()
    .min(0)
    .max(3)
    .optional()
    .describe("Prioridad de 0 (baja) a 3 (alta)"),
})

export type CopilotCreateTaskPayload = z.infer<
  typeof copilotCreateTaskPayloadSchema
>
