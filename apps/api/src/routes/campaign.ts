import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { requireAuth } from "@/middlewares/require-auth"
import { campaignListQuerySchema } from "@workspace/schemas"
import { listCampaignsForSwitcher } from "@/services/campaign"

export const campaignRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get("/", zValidator("query", campaignListQuerySchema), async (c) => {
    const { parcelId } = c.req.valid("query")
    const campaigns = await listCampaignsForSwitcher(parcelId)
    return c.json({ campaigns }, 200)
  })
