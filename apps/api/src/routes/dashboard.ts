import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { requireAuth } from "@/middlewares/require-auth"
import { dashboardOverviewQuerySchema } from "@workspace/schemas"
import { getDashboardOverview } from "@/services/dashboard"

export const dashboardRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get("/overview", zValidator("query", dashboardOverviewQuerySchema), async (c) => {
    const filters = c.req.valid("query")
    const overview = await getDashboardOverview(
      c.get("organizationId"),
      filters
    )
    return c.json({ overview }, 200)
  })
