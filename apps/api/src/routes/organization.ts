import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@workspace/api/types/variables"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "@workspace/api/middlewares/require-auth"
import { apiResponse } from "@workspace/api/lib/api-response"
import {
  getActiveOrganization,
  updateOrganization,
  getOrganizationMembers,
  getOrganizationMe,
  bulkCreateInvitations,
  cancelInvitation,
  createInvitation,
  listInvitations,
} from "@workspace/api/services/auth"
import {
  invitationBulkCreateSchema,
  invitationCreateSchema,
  updateOrganizationSchema,
} from "@workspace/schemas"
import { requireRole } from "@workspace/api/middlewares/require-role"

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
    return c.json(
      apiResponse({
        data,
        meta: { scope: "organization", mode: "full" },
      }),
      200
    )
  })
  .get("/members", async (c) => {
    const members = await getOrganizationMembers(c.get("organizationId"))
    return c.json(
      apiResponse({
        data: { members },
        meta: { scope: "organization", mode: "full" },
      }),
      200
    )
  })
  .get("/me", async (c) => {
    const user = c.get("user")
    const member = c.get("member")
    const data = await getOrganizationMe(user, member)
    return c.json(
      apiResponse({
        data,
        meta: { scope: "organization", mode: "full" },
      }),
      200
    )
  })
  .use(requireRole("admin"))
  .put("/name", zValidator("json", updateOrganizationSchema), async (c) => {
    const organizationId = c.get("organizationId")
    const data = c.req.valid("json")
    const organization = await updateOrganization(organizationId, data)
    return c.json(
      apiResponse({
        data: { organization },
        meta: { scope: "organization", mode: "full" },
      }),
      200
    )
  })
  .get("/invitations", async (c) => {
    const invitations = await listInvitations(
      c.get("organizationId"),
      c.req.raw.headers
    )
    return c.json(
      apiResponse({
        data: { invitations },
        meta: { scope: "organization", mode: "full" },
      }),
      200
    )
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
      return c.json(
        apiResponse({
          data: result,
          meta: { scope: "organization", mode: "full" },
        }),
        201
      )
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
      return c.json(
        apiResponse({
          data: { invitation },
          meta: { scope: "organization", mode: "full" },
        }),
        201
      )
    }
  )
  .delete("/invitations/:id", async (c) => {
    await cancelInvitation(
      c.req.param("id"),
      c.get("organizationId"),
      c.req.raw.headers
    )
    return c.json(
      apiResponse({
        data: { id: c.req.param("id") },
        meta: { scope: "organization", mode: "full" },
      }),
      200
    )
  })
