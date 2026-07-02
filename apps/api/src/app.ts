import { Hono } from "hono"
import { auth } from "@workspace/auth"
import type { Env } from "@env"
import type { ApiVariables } from "@workspace/api/types/variables"
import { errorHandler } from "@workspace/api/middlewares/error-handler"
import { corsMiddleware } from "@workspace/api/middlewares/cors"
import { parcelRoutes } from "@workspace/api/routes/parcel"
import { organizationRoutes } from "@workspace/api/routes/organization"
import { userRoutes } from "@workspace/api/routes/user"
import { billingRoutes } from "@workspace/api/routes/billing"
import { searchRoutes } from "@workspace/api/routes/search"
import { financeRoutes } from "@workspace/api/routes/finance"
import { copilotRoutes } from "@workspace/api/routes/copilot"
import { campaignRoutes } from "@workspace/api/routes/campaign"
import { taskRoutes } from "@workspace/api/routes/tasks"
import { recommendationRoutes } from "@workspace/api/routes/recommendations"
import { weatherRoutes } from "@workspace/api/routes/weather"
import { dashboardRoutes } from "@workspace/api/routes/dashboard"
import { logger } from "hono/logger"

export const app = new Hono<{ Bindings: Env; Variables: ApiVariables }>()
  .basePath("/api/v1")
  .onError(errorHandler)
  .use(corsMiddleware)

  .use(logger())

  .get("/healthz", (c) => c.text("OK"))

  .on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))
  // routa para ver las peticiones entrantes y salientes
  .route("/organization", organizationRoutes)
  .route("/user", userRoutes)
  .route("/search", searchRoutes)
  .route("/parcel", parcelRoutes)
  .route("/billing", billingRoutes)
  .route("/finance", financeRoutes)
  .route("/copilot", copilotRoutes)
  .route("/campaign", campaignRoutes)
  .route("/tasks", taskRoutes)
  .route("/recommendations", recommendationRoutes)
  .route("/weather", weatherRoutes)
  .route("/dashboard", dashboardRoutes)
  // ruta para weather

export type AppType = typeof app
