// import { streamCopilotResponse } from "@workspace/copilot"
import type { Env } from "@env"
import { zValidator } from "@hono/zod-validator"
import { copilotChatRequestSchema } from "@workspace/schemas"
import { Hono } from "hono"
// import type { UIMessage } from "ai"
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai"

import { requireAuth } from "@workspace/api/middlewares/require-auth"
import type { AuthVariables } from "@workspace/api/types/variables"
import { apiResponse } from "@workspace/api/lib/api-response"
// import { resolveCopilotContext, executeCopilotQuery, getLastUserText, getCopilotSuggestions } from "@workspace/api/services/copilot"
import { getCopilotSuggestions } from "@workspace/api/services/copilot"

const COPILOT_UNDER_CONSTRUCTION_MESSAGE =
  "El copiloto de Agropilot está en construcción. Estamos trabajando para que pronto puedas consultar tus parcelas, finanzas y tareas desde aquí. ¡Gracias por tu paciencia!"

function copilotUnderConstructionResponse(): Response {
  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute({ writer }) {
        const textId = "copilot-under-construction"
        writer.write({ type: "text-start", id: textId })
        writer.write({
          type: "text-delta",
          id: textId,
          delta: COPILOT_UNDER_CONSTRUCTION_MESSAGE,
        })
        writer.write({ type: "text-end", id: textId })
      },
    }),
  })
}

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
    // TODO: Rehabilitar el copiloto cuando el módulo esté listo para producción.
    // const body = c.req.valid("json")
    // const messages = body.messages as UIMessage[]
    //
    // const organizationId = c.get("organizationId")
    // const ctx = await resolveCopilotContext(
    //   organizationId,
    //   c.get("user").id,
    //   body.parcelId
    // )
    //
    // return await streamCopilotResponse(messages, {
    //   executeQuery: executeCopilotQuery,
    //   ctx,
    // })

    c.req.valid("json")
    return copilotUnderConstructionResponse()
  })
