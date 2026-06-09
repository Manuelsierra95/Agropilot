import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { requireAuth } from "@/middlewares/require-auth"
import { requireRole } from "@/middlewares/require-role"
import { getActiveOrganization } from "@/services/organization"
import { getBillingMe, toggleModule } from "@/services/billing"
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

    return c.json(data)
  })
  // Redirect al customer portal de Stripe
  .post("/portal", async (c) => {
    // TODO: implementar cuando integres Stripe SDK
    // const session = await stripe.billingPortal.sessions.create({...})
    throw new HTTPException(501, { message: "Stripe not configured yet" })
  })
  // Cancelar suscripción
  .post("/cancel", async (c) => {
    // TODO: stripe.subscriptions.update(id, { cancel_at_period_end: true })
    throw new HTTPException(501, { message: "Stripe not configured yet" })
  })
  // Activar / desactivar módulo
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
      return c.json({ success: true })
    }
  )
