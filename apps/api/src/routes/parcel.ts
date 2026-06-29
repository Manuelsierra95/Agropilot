import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "@/middlewares/require-auth"
import { createCacheMiddleware } from "@/middlewares/cache"
import { apiQuerySchema } from "@workspace/schemas"
import { parseInclude } from "@/lib/parse-include"
import { apiResponse } from "@/lib/api-response"
import {
  createParcel,
  deleteParcel,
  getParcelById,
  getParcelCropOverview,
  getParcelAgroclimateForDashboard,
  getParcelsCropOverviewsForDashboard,
  getParcelsRecommendationsForDashboard,
  getParcelsRisksForDashboard,
  getParcelsWeatherComparisonForDashboard,
  getParcelRecommendations,
  getParcelWeather,
  getParcelsForMap,
  listParcels,
  updateParcel,
} from "@/services/parcels"
import {
  parcelCreateSchema,
  parcelUpdateInputSchema,
} from "@workspace/schemas"

const cache5min = createCacheMiddleware({ ttlSeconds: 300 })
const cache1min = createCacheMiddleware({ ttlSeconds: 60 })

export const parcelRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)

  .get("/", cache1min, async (c) => {
    const parcels = await listParcels(c.get("organizationId"))
    return c.json(
      apiResponse({
        data: { parcels },
        meta: { scope: "organization", mode: "full" },
      }),
      200
    )
  })

  .get("/map", async (c) => {
    const mapParcels = await getParcelsForMap(c.get("organizationId"))
    return c.json(
      apiResponse({
        data: { mapParcels },
        meta: { scope: "organization", mode: "full" },
      }),
      200
    )
  })

  .get(
    "/dashboard",
    cache5min,
    zValidator("query", apiQuerySchema),
    async (c) => {
      const query = c.req.valid("query")
      const include = parseInclude(query.include)
      const organizationId = c.get("organizationId")

      const data: Record<string, unknown> = {}

      if (include.includes("cropOverviews") || include.length === 0) {
        data.cropOverviews = await getParcelsCropOverviewsForDashboard(
          organizationId,
          query
        )
      }
      if (include.includes("recommendations")) {
        data.recommendations = await getParcelsRecommendationsForDashboard(
          organizationId
        )
      }
      if (include.includes("risks")) {
        data.risks = await getParcelsRisksForDashboard(organizationId)
      }
      if (include.includes("weatherComparison")) {
        data.weatherComparison =
          await getParcelsWeatherComparisonForDashboard(organizationId, query)
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
    }
  )

  .get("/:id/recommendations", async (c) => {
    const recommendations = await getParcelRecommendations(
      c.get("organizationId"),
      c.req.param("id")
    )
    return c.json(
      apiResponse({
        data: { recommendations },
        meta: { scope: "parcel", mode: "full", parcelId: c.req.param("id") },
      }),
      200
    )
  })

  .get("/:id/weather", async (c) => {
    const weather = await getParcelWeather(
      c.get("organizationId"),
      c.req.param("id")
    )
    return c.json(
      apiResponse({
        data: { weather },
        meta: { scope: "parcel", mode: "full", parcelId: c.req.param("id") },
      }),
      200
    )
  })

  .get(
    "/:id/crop-overview",
    zValidator("query", apiQuerySchema),
    async (c) => {
      const query = c.req.valid("query")
      const olivar = await getParcelCropOverview(
        c.get("organizationId"),
        c.req.param("id"),
        query
      )
      return c.json(
        apiResponse({
          data: { olivar },
          meta: {
            scope: "parcel",
            mode: query.mode,
            parcelId: c.req.param("id"),
            from: query.from,
            to: query.to,
          },
        }),
        200
      )
    }
  )

  .get(
    "/:id/agroclimate",
    cache5min,
    zValidator("query", apiQuerySchema),
    async (c) => {
      const query = c.req.valid("query")
      const agroclimate = await getParcelAgroclimateForDashboard(
        c.get("organizationId"),
        c.req.param("id"),
        query
      )
      return c.json(
        apiResponse({
          data: { agroclimate },
          meta: {
            scope: "parcel",
            mode: query.mode,
            parcelId: c.req.param("id"),
            from: query.from,
            to: query.to,
          },
        }),
        200
      )
    }
  )

  .get("/:id", async (c) => {
    const parcel = await getParcelById(
      c.get("organizationId"),
      c.req.param("id")
    )
    return c.json(
      apiResponse({
        data: { parcel },
        meta: { scope: "parcel", mode: "full", parcelId: c.req.param("id") },
      }),
      200
    )
  })

  .post("/", zValidator("json", parcelCreateSchema), async (c) => {
    const data = c.req.valid("json")
    const parcel = await createParcel(c.get("organizationId"), data)
    const parcelWithId = parcel as { id: string } & typeof parcel
    return c.json(
      apiResponse({
        data: { parcel },
        meta: { scope: "parcel", mode: "full", parcelId: parcelWithId.id },
      }),
      201
    )
  })

  .put("/:id", zValidator("json", parcelUpdateInputSchema), async (c) => {
    const data = c.req.valid("json")
    const parcel = await updateParcel(
      c.get("organizationId"),
      c.req.param("id"),
      data
    )
    return c.json(
      apiResponse({
        data: { parcel },
        meta: { scope: "parcel", mode: "full", parcelId: c.req.param("id") },
      }),
      200
    )
  })

  .delete("/:id", async (c) => {
    await deleteParcel(c.get("organizationId"), c.req.param("id"))
    return c.json(
      apiResponse({
        data: { id: c.req.param("id") },
        meta: { scope: "parcel", mode: "full", parcelId: c.req.param("id") },
      }),
      200
    )
  })
