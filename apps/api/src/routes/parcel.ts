import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "@/middlewares/require-auth"
import {
  createParcel,
  deleteParcel,
  getParcelById,
  getParcelCropOverview,
  getParcelRecommendations,
  getParcelRisks,
  getParcelsForMap,
  listParcels,
  updateParcel,
} from "@/services/parcel"
import {
  parcelCreateSchema,
  parcelUpdateInputSchema,
  dashboardScopeQuerySchema,
} from "@workspace/schemas"

export const parcelRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get("/", async (c) => {
    const parcels = await listParcels(c.get("organizationId"))
    return c.json({ parcels }, 200)
  })
  .get("/map", async (c) => {
    const mapParcels = await getParcelsForMap(c.get("organizationId"))
    return c.json({ mapParcels }, 200)
  })
  .get("/:id/recommendations", async (c) => {
    const recommendations = await getParcelRecommendations(
      c.get("organizationId"),
      c.req.param("id")
    )
    return c.json({ recommendations }, 200)
  })
  .get("/:id/risks", async (c) => {
    const risks = await getParcelRisks(
      c.get("organizationId"),
      c.req.param("id")
    )
    return c.json({ risks }, 200)
  })
  .get(
    "/:id/crop-overview",
    zValidator("query", dashboardScopeQuerySchema),
    async (c) => {
      const filters = c.req.valid("query")
      const olivar = await getParcelCropOverview(
        c.get("organizationId"),
        c.req.param("id"),
        filters
      )
      return c.json({ olivar }, 200)
    }
  )
  .get("/:id", async (c) => {
    const parcel = await getParcelById(
      c.get("organizationId"),
      c.req.param("id")
    )
    return c.json({ parcel }, 200)
  })
  .post("/", zValidator("json", parcelCreateSchema), async (c) => {
    const data = c.req.valid("json")
    const parcel = await createParcel(c.get("organizationId"), data)
    return c.json({ parcel }, 201)
  })
  .put("/:id", zValidator("json", parcelUpdateInputSchema), async (c) => {
    const data = c.req.valid("json")
    const parcel = await updateParcel(
      c.get("organizationId"),
      c.req.param("id"),
      data
    )
    return c.json({ parcel }, 200)
  })
  .delete("/:id", async (c) => {
    await deleteParcel(c.get("organizationId"), c.req.param("id"))
    return c.json({ id: c.req.param("id") }, 200)
  })
