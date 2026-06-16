import type { Env } from "@env"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { parcelWeatherQuerySchema } from "@workspace/schemas"

import { requireAuth } from "@/middlewares/require-auth"
import { createCacheMiddleware } from "@/middlewares/cache"
import type { AuthVariables } from "@/types/variables"
import { getParcelWeatherForCalendar } from "@/services/weather"

const cache5min = createCacheMiddleware({ ttlSeconds: 300 })

export const weatherRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get(
    "/:parcelId",
    cache5min,
    zValidator("query", parcelWeatherQuerySchema),
    async (c) => {
      const query = c.req.valid("query")
      const weather = await getParcelWeatherForCalendar(
        c.get("organizationId"),
        c.req.param("parcelId"),
        query
      )
      return c.json(weather, 200)
    }
  )
