import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "@/middlewares/require-auth"
import {
  createParcel,
  deleteParcel,
  getParcelById,
  listParcels,
  updateParcel,
} from "@/services/parcel"
import {
  parcelCreateSchema,
  parcelUpdateInputSchema,
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
