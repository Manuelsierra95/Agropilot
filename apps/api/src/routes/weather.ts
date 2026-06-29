import type { Env } from "@env"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "@workspace/api/middlewares/require-auth"
import type { AuthVariables } from "@workspace/api/types/variables"
import { apiQuerySchema } from "@workspace/schemas"
import { apiResponse } from "@workspace/api/lib/api-response"
import { getParcelWeatherForCalendar } from "@workspace/api/services/weather"

export const weatherRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get("/", zValidator("query", apiQuerySchema), async (c) => {
    const query = c.req.valid("query")
    const organizationId = c.get("organizationId")

    if (!query.parcelId) {
      return c.json(
        apiResponse({
          data: { weather: null },
          meta: { scope: "organization", mode: query.mode },
        }),
        200
      )
    }

    const weather = await getParcelWeatherForCalendar(
      organizationId,
      query.parcelId,
      { from: query.from, to: query.to }
    )

    return c.json(
      apiResponse({
        data: { weather },
        meta: {
          scope: "parcel",
          mode: query.mode,
          parcelId: query.parcelId,
          from: query.from,
          to: query.to,
        },
      }),
      200
    )
  })
