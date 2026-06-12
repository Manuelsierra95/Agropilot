import { streamCopilotResponse } from "@workspace/copilot"
import type { Env } from "@env"
import { zValidator } from "@hono/zod-validator"
import { copilotChatRequestSchema } from "@workspace/schemas"
import { Hono } from "hono"
import type { UIMessage } from "ai"

import { requireAuth } from "@/middlewares/require-auth"
import type { AuthVariables } from "@/types/variables"
import { resolveCopilotContext } from "@/services/copilot/context"
import { executeCopilotQuery } from "@/services/copilot/query-executor"
import { getLastUserText } from "@/services/copilot/last-user-text"
import { getCopilotSuggestions } from "@/services/copilot/suggestions"

export const copilotRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get("/suggestions", async (c) => {
    const suggestions = await getCopilotSuggestions()
    return c.json({ suggestions }, 200)
  })
  .post("/chat", zValidator("json", copilotChatRequestSchema), async (c) => {
    const body = c.req.valid("json")
    const messages = body.messages as UIMessage[]

    const organizationId = c.get("organizationId")
    const ctx = await resolveCopilotContext(
      organizationId,
      c.get("user").id,
      body.parcelId
    )

    console.log("[copilot/chat] request", {
      organizationId,
      parcelId: body.parcelId,
      activeParcelId: ctx.activeParcelId,
      organizationName: ctx.organizationName,
      activeParcelName: ctx.activeParcelName,
      messageCount: messages.length,
      lastUserText: getLastUserText(body.messages),
    })

    return await streamCopilotResponse(messages, {
      executeQuery: executeCopilotQuery,
      ctx,
    })
  })
