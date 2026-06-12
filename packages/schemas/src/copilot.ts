import { z } from "zod"

const copilotMessagePartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
})

const copilotMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(copilotMessagePartSchema),
})

export const copilotChatRequestSchema = z.object({
  messages: z.array(copilotMessageSchema).min(1),
  parcelId: z.string().uuid().optional(),
})

export type CopilotChatRequest = z.infer<typeof copilotChatRequestSchema>
