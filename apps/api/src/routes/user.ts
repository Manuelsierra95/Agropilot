import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@workspace/api/types/variables"
import { requireAuth } from "@workspace/api/middlewares/require-auth"
import { apiResponse } from "@workspace/api/lib/api-response"
import { getUserMe, updateUserOnboarding } from "@workspace/api/services/auth"
import { zValidator } from "@hono/zod-validator"
import { userOnboardingUpdateSchema } from "@workspace/schemas"

export const userRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get("/me", async (c) => {
    const user = c.get("user")
    const member = c.get("member")
    const data = await getUserMe(user, member)
    return c.json(
      apiResponse({
        data,
        meta: { scope: "organization", mode: "full" },
      }),
      200
    )
  })
  .patch("/me", zValidator("json", userOnboardingUpdateSchema), async (c) => {
    const user = c.get("user")
    const body = c.req.valid("json")
    const data = await updateUserOnboarding(user.id, body.onboardingStep)
    return c.json(
      apiResponse({
        data,
        meta: { scope: "organization", mode: "full" },
      }),
      200
    )
  })
