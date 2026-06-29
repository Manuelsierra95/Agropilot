import { z } from "zod"
import { copilotMessageSchema } from "./context"

export const copilotChatRequestSchema = z.object({
  messages: z.array(copilotMessageSchema).min(1),
  parcelId: z.string().uuid().optional(),
})

export type CopilotChatRequest = z.infer<typeof copilotChatRequestSchema>
