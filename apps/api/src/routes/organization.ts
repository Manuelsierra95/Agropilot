import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { requireAuth } from "@/middlewares/require-auth"
import { getActiveOrganization } from "@/services/organization"

export const organizationRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>().get("/active", requireAuth, async (c) => {
  const data = await getActiveOrganization(
    c.get("organizationId"),
    c.get("member")
  )
  return c.json(data, 200)
})
