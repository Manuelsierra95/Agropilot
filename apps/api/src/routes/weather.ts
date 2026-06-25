import type { Env } from "@env"
import { Hono } from "hono"
import { requireAuth } from "@/middlewares/require-auth"
import type { AuthVariables } from "@/types/variables"

export const weatherRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>().use(requireAuth)
