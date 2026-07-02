import type { Env } from "@env"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import {
  recommendationAcceptInputSchema,
  recommendationListQuerySchema,
} from "@workspace/schemas"

import { requireAuth } from "@workspace/api/middlewares/require-auth"
import type { AuthVariables } from "@workspace/api/types/variables"
import { apiResponse } from "@workspace/api/lib/api-response"
import {
  acceptRecommendation,
  dismissRecommendation,
  listActiveRecommendations,
  mapRecommendationToDashboard,
} from "@workspace/api/services/recommendations"

export const recommendationRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)

  .get("/", zValidator("query", recommendationListQuerySchema), async (c) => {
    const query = c.req.valid("query")
    const organizationId = c.get("organizationId")
    const recommendations = await listActiveRecommendations(
      organizationId,
      query
    )

    return c.json(
      apiResponse({
        data: {
          recommendations: recommendations.map((rec) => ({
            ...mapRecommendationToDashboard(rec),
            parcelId: rec.parcelId,
            parcelName: rec.parcelName,
          })),
        },
        meta: {
          scope: query.parcelId ? "parcel" : "organization",
          mode: "full",
          ...(query.parcelId ? { parcelId: query.parcelId } : {}),
        },
      }),
      200
    )
  })

  .post("/:recommendationId/accept", async (c) => {
      const recommendationId = c.req.param("recommendationId")
      const organizationId = c.get("organizationId")

      let input = {}
      try {
        const body = await c.req.json()
        const parsed = recommendationAcceptInputSchema.safeParse(body)
        if (parsed.success) {
          input = parsed.data
        }
      } catch {
        // empty body is valid
      }

      const result = await acceptRecommendation(
        organizationId,
        recommendationId,
        input
      )

      return c.json(
        apiResponse({
          data: result,
          meta: { scope: "organization", mode: "full" },
        }),
        201
      )
    })

  .post("/:recommendationId/dismiss", async (c) => {
    const recommendationId = c.req.param("recommendationId")
    const organizationId = c.get("organizationId")

    const recommendation = await dismissRecommendation(
      organizationId,
      recommendationId
    )

    return c.json(
      apiResponse({
        data: { recommendation },
        meta: { scope: "organization", mode: "full" },
      }),
      200
    )
  })
