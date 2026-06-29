import { streamCopilotResponse } from "@workspace/copilot"
import type { Env } from "@env"
import { zValidator } from "@hono/zod-validator"
import { copilotChatRequestSchema } from "@workspace/schemas"
import { Hono } from "hono"
import type { UIMessage } from "ai"

import { requireAuth } from "@workspace/api/middlewares/require-auth"
import type { AuthVariables } from "@workspace/api/types/variables"
import { apiResponse } from "@workspace/api/lib/api-response"
import { resolveCopilotContext, executeCopilotQuery, getLastUserText, getCopilotSuggestions } from "@workspace/api/services/copilot"

export const copilotRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get("/suggestions", async (c) => {
    const suggestions = await getCopilotSuggestions()
    return c.json(
      apiResponse({
        data: { suggestions },
        meta: { scope: "organization", mode: "full" },
      }),
      200
    )
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

    return await streamCopilotResponse(messages, {
      executeQuery: executeCopilotQuery,
      ctx,
    })
  })
