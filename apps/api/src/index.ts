import { Hono } from "hono"
import { auth } from "@workspace/auth"
import { parcelRoutes } from "@/routes/parcel"
import { exampleRoutes } from "@/routes/example"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { corsMiddleware } from "./middlewares/cors"
import { csrfMiddleware } from "./middlewares/csrf"
import { rateLimitMiddleware } from "./middlewares/rateLimit"

const app = new Hono<{ Bindings: Env; Variables: ApiVariables }>()

app
  .basePath("/api/v1")
  .use(corsMiddleware)
  // .use(csrfMiddleware)
  // .use(rateLimitMiddleware)

  .get("/healthz", (c) => c.text("OK"))

  // Rutas de ejemplo para auth: public, optional, protected y rbac.
  .route("/example", exampleRoutes)

  .on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))

  .route("/parcel", parcelRoutes)

export default app
