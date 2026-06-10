import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { requireAuth } from "@/middlewares/require-auth"
import { getDashboardOverview } from "@/services/dashboard"

export const dashboardRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get("/overview", async (c) => {
    const overview = await getDashboardOverview(c.get("organizationId"))
    return c.json({ overview }, 200)
  })
