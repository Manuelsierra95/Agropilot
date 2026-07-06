import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@workspace/api/types/variables"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "@workspace/api/middlewares/require-auth"
import { createCacheMiddleware } from "@workspace/api/middlewares/cache"
import { apiResponse } from "@workspace/api/lib/api-response"
import {
  listHarvestDeliveries,
  createHarvestSale,
  createHarvestDelivery,
} from "@workspace/api/services/production"
import {
  harvestDeliveriesQuerySchema,
  harvestDeliveryCreateSchema,
  harvestSaleCreateSchema,
} from "@workspace/schemas"

const cache5min = createCacheMiddleware({ ttlSeconds: 300 })

export const productionRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)

  .get(
    "/deliveries",
    cache5min,
    zValidator("query", harvestDeliveriesQuerySchema),
    async (c) => {
      const query = c.req.valid("query")
      const deliveries = await listHarvestDeliveries(
        c.get("organizationId"),
        query
      )

      return c.json(
        apiResponse({
          data: { deliveries },
          meta: { scope: "parcel", mode: "full", parcelId: query.parcelId },
        }),
        200
      )
    }
  )

  .post(
    "/deliveries",
    zValidator("json", harvestDeliveryCreateSchema),
    async (c) => {
      const data = c.req.valid("json")
      const delivery = await createHarvestDelivery(
        c.get("organizationId"),
        data
      )

      return c.json(
        apiResponse({
          data: { delivery },
          meta: { scope: "parcel", mode: "full", parcelId: data.parcelId },
        }),
        201
      )
    }
  )

  .post("/sales", zValidator("json", harvestSaleCreateSchema), async (c) => {
    const data = c.req.valid("json")
    const { transaction, sales } = await createHarvestSale(
      c.get("organizationId"),
      c.get("user").id,
      data.parcelId,
      data
    )

    return c.json(
      apiResponse({
        data: { transaction, sales },
        meta: { scope: "parcel", mode: "full", parcelId: data.parcelId },
      }),
      201
    )
  })
