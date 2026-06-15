import type { Env } from "@env"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { parcelWeatherQuerySchema } from "@workspace/schemas"

import { requireAuth } from "@/middlewares/require-auth"
import type { AuthVariables } from "@/types/variables"
import { getParcelWeatherForCalendar } from "@/services/weather"

export const weatherRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get(
    "/:parcelId",
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
