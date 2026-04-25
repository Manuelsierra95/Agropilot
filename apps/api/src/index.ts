import { Hono } from "hono"
import { auth } from "@workspace/auth"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { errorHandler } from "@/middlewares/error-handler"
import { corsMiddleware } from "@/middlewares/cors"
import { csrfMiddleware } from "@/middlewares/csrf"
import { rateLimitMiddleware } from "@/middlewares/rateLimit"
import { parcelRoutes } from "./routes/parcel"
import { organizationRoutes } from "./routes/organization"

const app = new Hono<{ Bindings: Env; Variables: ApiVariables }>()
  .basePath("/api/v1")
  .onError(errorHandler)
  .use(corsMiddleware)
  // .use(csrfMiddleware)
  // .use(rateLimitMiddleware)

  .get("/healthz", (c) => c.text("OK"))

  .on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))

  .route("/parcel", parcelRoutes)
  .route("/organization", organizationRoutes)

export type AppType = typeof app
export default app
