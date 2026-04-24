import { Hono } from "hono"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { requireAuth } from "@/middlewares/require-auth"
import { getActiveOrganization } from "@/services/organization"

export const organizationRoutes = new Hono<{
  Bindings: Env
  Variables: ApiVariables
}>()
  .use("/active", requireAuth)
  .get("/active", async (c) => {
    const data = await getActiveOrganization({
      user: c.get("user"),
      session: c.get("session"),
      requestedOrganizationId: c.req.header("x-organization-id"),
    })
    return c.json(data, 200)
  })
