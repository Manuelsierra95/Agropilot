import { Hono } from "hono"
import { auth } from "@workspace/auth"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { errorHandler } from "@/middlewares/error-handler"
import { corsMiddleware } from "@/middlewares/cors"
import { csrfMiddleware } from "@/middlewares/csrf"
// import { rateLimitMiddleware } from "@/middlewares/rateLimit"
import { parcelRoutes } from "./routes/parcel"
import { organizationRoutes } from "./routes/organization"
import { userRoutes } from "./routes/user"
import { billingRoutes } from "./routes/billing"
import { searchRoutes } from "./routes/search"
import { financeRoutes } from "./routes/finance"

const app = new Hono<{ Bindings: Env; Variables: ApiVariables }>()
  .basePath("/api/v1")
  .onError(errorHandler)
  .use(corsMiddleware)
  // .use(csrfMiddleware)
  // .use(rateLimitMiddleware)

  .get("/healthz", (c) => c.text("OK"))

  .on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))

  .route("/organization", organizationRoutes)
  .route("/user", userRoutes)
  .route("/search", searchRoutes)
  .route("/parcel", parcelRoutes)
  .route("/billing", billingRoutes)
  .route("/finance", financeRoutes)

const PORT = process.env.PORT || 3001

export type AppType = typeof app
export default {
  port: PORT,
  fetch: app.fetch,
}
