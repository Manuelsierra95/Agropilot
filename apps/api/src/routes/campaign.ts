import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import type { Env } from "@env"
import type { AuthVariables } from "@workspace/api/types/variables"
import { requireAuth } from "@workspace/api/middlewares/require-auth"
import { campaignListQuerySchema } from "@workspace/schemas"
import { apiResponse } from "@workspace/api/lib/api-response"
import { listCampaignsForSwitcher } from "@workspace/api/services/campaigns"

export const campaignRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get("/", zValidator("query", campaignListQuerySchema), async (c) => {
    const { parcelId } = c.req.valid("query")
    const campaigns = await listCampaignsForSwitcher(parcelId)
    return c.json(
      apiResponse({
        data: { campaigns },
        meta: {
          scope: parcelId ? "parcel" : "organization",
          mode: "full",
          ...(parcelId ? { parcelId } : {}),
        },
      }),
      200
    )
  })
