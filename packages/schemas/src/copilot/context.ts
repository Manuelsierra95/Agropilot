import { z } from "zod"

export const copilotMessagePartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
})

export const copilotMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(copilotMessagePartSchema),
})

export type CopilotMessagePart = z.infer<typeof copilotMessagePartSchema>
export type CopilotMessage = z.infer<typeof copilotMessageSchema>
