import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { requireAuth } from "@/middlewares/require-auth"
import { getUserMe } from "@/services/user"

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
