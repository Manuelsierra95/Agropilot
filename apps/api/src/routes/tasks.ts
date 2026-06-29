import type { Env } from "@env"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { apiQuerySchema, taskCreateInputSchema } from "@workspace/schemas"

import { requireAuth } from "@workspace/api/middlewares/require-auth"
import type { AuthVariables } from "@workspace/api/types/variables"
import { parseInclude } from "@workspace/api/lib/parse-include"
import { apiResponse } from "@workspace/api/lib/api-response"
import {
  createTask,
  listCalendarTasks,
  listUpcomingWeekTasks,
} from "@workspace/api/services/tasks"

export const taskRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)

  .get("/calendar", zValidator("query", apiQuerySchema), async (c) => {
    const query = c.req.valid("query")
    const include = parseInclude(query.include)
    const organizationId = c.get("organizationId")

    const data: Record<string, unknown> = {}

    if (include.includes("events") || include.length === 0) {
      data.events = await listCalendarTasks(organizationId, query)
    }
    if (include.includes("upcomingWeek")) {
      data.upcomingWeek = await listUpcomingWeekTasks(organizationId, {
        parcelId: query.parcelId,
        weekStart: query.from,
      })
    }

    return c.json(
      apiResponse({
        data,
        meta: {
          scope: query.parcelId ? "parcel" : "organization",
          mode: query.mode,
          from: query.from,
          to: query.to,
          ...(query.parcelId ? { parcelId: query.parcelId } : {}),
        },
      }),
      200
    )
  })

  .post("/", zValidator("json", taskCreateInputSchema), async (c) => {
    const data = c.req.valid("json")
    const task = await createTask(c.get("organizationId"), data)
    return c.json(
      apiResponse({
        data: { task },
        meta: { scope: "parcel", mode: "full" },
      }),
      201
    )
  })
