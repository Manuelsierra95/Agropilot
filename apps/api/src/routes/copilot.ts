import { streamCopilotResponse } from "@workspace/copilot"
import type { Env } from "@env"
import { Hono } from "hono"
import type { UIMessage } from "ai"

import { requireAuth } from "@/middlewares/require-auth"
import type { AuthVariables } from "@/types/variables"
import { executeCopilotQuery } from "@/services/copilot/query-executor"
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
  .post("/chat", async (c) => {
    const body = await c.req.json<{ messages: UIMessage[] }>()
    const messages = body.messages ?? []

    const ctx = {
      organizationId: c.get("organizationId"),
      userId: c.get("user").id,
      defaultParcelId: undefined,
    }

    return streamCopilotResponse(messages, {
      executeQuery: executeCopilotQuery,
      ctx,
    })
  })
