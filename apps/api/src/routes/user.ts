import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { requireAuth } from "@/middlewares/require-auth"
import { getUserMe, updateUserOnboarding } from "@/services/user"
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
    return c.json(data, 200)
  })
  .patch("/me", zValidator("json", userOnboardingUpdateSchema), async (c) => {
    const user = c.get("user")
    const body = c.req.valid("json")
    const data = await updateUserOnboarding(user.id, body.onboardingStep)
    return c.json(data, 200)
  })
