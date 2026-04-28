import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "@/middlewares/require-auth"
import {
  getActiveOrganization,
  updateOrganization,
  getOrganizationMembers,
  getOrganizationMe,
} from "@/services/organization"
import { updateOrganizationSchema } from "@workspace/schemas"
import { requireRole } from "@/middlewares/require-role"

export const organizationRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get("/active", async (c) => {
    const data = await getActiveOrganization(
      c.get("organizationId"),
      c.get("member")
    )
    return c.json(data, 200)
  })
  .get("/members", async (c) => {
    const members = await getOrganizationMembers(c.get("organizationId"))
    return c.json({ members }, 200)
  })
  .get("/me", async (c) => {
    const user = c.get("user")
    const member = c.get("member")
    const data = await getOrganizationMe(user, member)
    return c.json(data, 200)
  })
  .use(requireRole("admin"))
  .put("/name", zValidator("json", updateOrganizationSchema), async (c) => {
    const organizationId = c.get("organizationId")
    const data = c.req.valid("json")
    const organization = await updateOrganization(organizationId, data)
    return c.json({ organization }, 200)
  })
