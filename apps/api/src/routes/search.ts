import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "@/middlewares/require-auth"
import {
  municipalitiesQuerySchema,
  streetsQuerySchema,
  coordsQuerySchema,
  refcatParamsSchema,
} from "@workspace/schemas"
import {
  fetchPolygon,
  getByRefcat,
  getMunicipalities,
  getProvinces,
  getStreets,
  searchByCoords,
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
  // De aqui obtenemos el objeto para renderizar primero streets.TipoVia y para los nombres de las calles streets.Denominacion
  .get("/streets", zValidator("query", streetsQuerySchema), async (c) => {
    const { province, municipality } = c.req.valid("query")
    const data = await getStreets({ province, municipality })
    return c.json({ data })
  })
  .get("/coords", zValidator("query", coordsQuerySchema), async (c) => {
    const { lat, lng } = c.req.valid("query")
    const data = await searchByCoords({ lat, lng })
    return c.json({ data })
  })
  .get(
    "/refcat/:refcat",
    zValidator("param", refcatParamsSchema),
    async (c) => {
      const { refcat } = c.req.valid("param")
      const data = await getByRefcat(refcat)
      return c.json({ data })
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
