import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@workspace/api/types/variables"
import { requireAuth } from "@workspace/api/middlewares/require-auth"
import { requireRole } from "@workspace/api/middlewares/require-role"
import { apiResponse } from "@workspace/api/lib/api-response"
import { getActiveOrganization } from "@workspace/api/services/auth"
import { getBillingMe, toggleModule } from "@workspace/api/services/billing"
import { HTTPException } from "hono/http-exception"
import { zValidator } from "@hono/zod-validator"
import { toggleModuleSchema } from "@workspace/schemas"
import z from "zod"

export const billingRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .use(requireRole("owner"))
  .get("/me", async (c) => {
    const member = c.get("member")
    const { organization } = await getActiveOrganization(
      member.organizationId,
      member
    )

    const data = await getBillingMe(member.organizationId, organization.plan)

    return c.json(
      apiResponse({
        data,
        meta: { scope: "organization", mode: "full" },
      }),
      200
    )
  })
  .post("/portal", async (c) => {
    throw new HTTPException(501, { message: "Stripe not configured yet" })
  })
  .post("/cancel", async (c) => {
    throw new HTTPException(501, { message: "Stripe not configured yet" })
  })
  .patch(
    "/modules/:slug",
    zValidator(
      "param",
      z.object({
        slug: z.enum(["ai-analysis", "field-notebook", "automations"]),
      })
    ),
    zValidator("json", toggleModuleSchema),
    async (c) => {
      const member = c.get("member")
      const slug = c.req.param("slug")
      const { active } = c.req.valid("json")
      await toggleModule(member.organizationId, slug, active)
      return c.json(
        apiResponse({
          data: { success: true },
          meta: { scope: "organization", mode: "full" },
        }),
        200
      )
    }
  )
