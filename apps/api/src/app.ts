import { Hono } from "hono"
import { auth } from "@workspace/auth"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { errorHandler } from "@/middlewares/error-handler"
import { corsMiddleware } from "@/middlewares/cors"
import { parcelRoutes } from "./routes/parcel"
import { organizationRoutes } from "./routes/organization"
import { userRoutes } from "./routes/user"
import { billingRoutes } from "./routes/billing"
import { searchRoutes } from "./routes/search"
import { financeRoutes } from "./routes/finance"
import { copilotRoutes } from "./routes/copilot"
import { campaignRoutes } from "./routes/campaign"
import { taskRoutes } from "./routes/tasks"
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

export type AppType = typeof app
