import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "@/middlewares/require-auth"
import {
  getActiveOrganization,
  updateOrganization,
  getOrganizationMembers,
  getOrganizationMe,
} from "@/services/organization"
import {
  bulkCreateInvitations,
  cancelInvitation,
  createInvitation,
  listInvitations,
} from "@/services/invitations"
import {
  invitationBulkCreateSchema,
  invitationCreateSchema,
  updateOrganizationSchema,
} from "@workspace/schemas"
import { requireRole } from "@/middlewares/require-role"

export const organizationRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get("/active", async (c) => {
    const data = await getActiveOrganization(
      c.get("organizationId"),
      c.get("member")
    )
    return c.json(data, 200)
  })
  .get("/members", async (c) => {
    const members = await getOrganizationMembers(c.get("organizationId"))
    return c.json({ members }, 200)
  })
  .get("/me", async (c) => {
    const user = c.get("user")
    const member = c.get("member")
    const data = await getOrganizationMe(user, member)
    return c.json(data, 200)
  })
  .use(requireRole("admin"))
  .put("/name", zValidator("json", updateOrganizationSchema), async (c) => {
    const organizationId = c.get("organizationId")
    const data = c.req.valid("json")
    const organization = await updateOrganization(organizationId, data)
    return c.json({ organization }, 200)
  })
  .get("/invitations", async (c) => {
    const invitations = await listInvitations(
      c.get("organizationId"),
      c.req.raw.headers
    )
    return c.json({ invitations }, 200)
  })
  .post(
    "/invitations/bulk",
    zValidator("json", invitationBulkCreateSchema),
    async (c) => {
      const { invitations: items } = c.req.valid("json")
      const result = await bulkCreateInvitations(
        c.get("organizationId"),
        items,
        c.req.raw.headers
      )
      return c.json(result, 201)
    }
  )
  .post(
    "/invitations",
    zValidator("json", invitationCreateSchema),
    async (c) => {
      const data = c.req.valid("json")
      const invitation = await createInvitation(
        c.get("organizationId"),
        data,
        c.req.raw.headers
      )
      return c.json({ invitation }, 201)
    }
  )
  .delete("/invitations/:id", async (c) => {
    await cancelInvitation(
      c.req.param("id"),
      c.get("organizationId"),
      c.req.raw.headers
    )
    return c.json({ id: c.req.param("id") }, 200)
  })
