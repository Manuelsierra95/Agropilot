import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "@/middlewares/require-auth"
import {
  addressSearchQuerySchema,
  municipalitiesQuerySchema,
  streetsQuerySchema,
  coordsQuerySchema,
  refcatParamsSchema,
} from "@workspace/schemas"
import {
  fetchPolygon,
  getMunicipalities,
  getProvinces,
  getStreets,
  searchByAddress,
  searchByCoords,
  searchByRefcat,
} from "@/services/search"

export const searchRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get("/provinces", async (c) => {
    const data = await getProvinces()
    return c.json({ data })
  })
  .get(
    "/municipalities",
    zValidator("query", municipalitiesQuerySchema),
    async (c) => {
      const { province } = c.req.valid("query")
      const data = await getMunicipalities(province)
      return c.json({ data })
    }
  )
  .get("/streets", zValidator("query", streetsQuerySchema), async (c) => {
    const { province, municipality } = c.req.valid("query")
    const data = await getStreets({ province, municipality })
    return c.json({ data })
  })
  .get("/address", zValidator("query", addressSearchQuerySchema), async (c) => {
    const query = c.req.valid("query")

    try {
      const data = await searchByAddress(query)
      return c.json({ data })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo localizar la parcela por dirección."
      return c.json({ error: message }, 400)
    }
  })
  .get("/coords", zValidator("query", coordsQuerySchema), async (c) => {
    const { lat, lng } = c.req.valid("query")

    try {
      const data = await searchByCoords({ lat, lng })
      return c.json({ data })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo localizar la parcela por coordenadas."
      return c.json({ error: message }, 400)
    }
  })
  .get(
    "/refcat/:refcat",
    zValidator("param", refcatParamsSchema),
    async (c) => {
      const { refcat } = c.req.valid("param")

      console.log("Searching by refcat:", refcat)

      try {
        const data = await searchByRefcat(refcat)
        console.log("Search result:", data)
        return c.json({ data })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo localizar la parcela por referencia catastral."
        console.error("Error searching by refcat:", error)
        return c.json({ error: message }, 400)
      }
    }
  )
  .get(
    "/refcat/:refcat/geometry",
    zValidator("param", refcatParamsSchema),
    async (c) => {
      const { refcat } = c.req.valid("param")
      const data = await fetchPolygon(refcat)
      return c.json({ data })
    }
  )
