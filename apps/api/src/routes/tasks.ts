import type { Env } from "@env"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import {
  dashboardCalendarEventsQuerySchema,
  dashboardUpcomingWeekQuerySchema,
  taskCreateInputSchema,
} from "@workspace/schemas"

import { requireAuth } from "@/middlewares/require-auth"
import type { AuthVariables } from "@/types/variables"
import {
  createTask,
  listCalendarTasks,
  listUpcomingWeekTasks,
} from "@/services/tasks"

export const taskRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get(
    "/calendar-events",
    zValidator("query", dashboardCalendarEventsQuerySchema),
    async (c) => {
      const filters = c.req.valid("query")
      const events = await listCalendarTasks(c.get("organizationId"), filters)
      return c.json({ events }, 200)
    }
  )
  .get(
    "/upcoming-week",
    zValidator("query", dashboardUpcomingWeekQuerySchema),
    async (c) => {
      const filters = c.req.valid("query")
      const events = await listUpcomingWeekTasks(
        c.get("organizationId"),
        filters
      )
      return c.json({ events }, 200)
    }
  )
  .post("/", zValidator("json", taskCreateInputSchema), async (c) => {
    const data = c.req.valid("json")
    const task = await createTask(c.get("organizationId"), data)
    return c.json({ task }, 201)
  })
