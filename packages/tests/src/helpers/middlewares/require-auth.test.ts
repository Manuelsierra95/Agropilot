import { Hono } from "hono"
import { beforeEach, describe, expect, it } from "vitest"

import { requireAuth } from "@workspace/api/middlewares/require-auth"
import {
  mockAuthenticatedSession,
  mockSessionWithoutMembership,
  mockSessionWithoutOrg,
  mockUnauthenticated,
} from "../mock-session"

const createApp = () =>
  new Hono().use(requireAuth).get("/protected", (c) =>
    c.json({
      userId: c.get("user").id,
      organizationId: c.get("organizationId"),
    })
  )

describe("requireAuth", () => {
  beforeEach(() => {
    mockUnauthenticated()
  })

  it("returns 401 when there is no session", async () => {
    const res = await createApp().request("/protected")
    expect(res.status).toBe(401)
  })

  it("returns 403 when session has no active organization", async () => {
    mockSessionWithoutOrg()
    const res = await createApp().request("/protected")
    expect(res.status).toBe(403)
  })

  it("returns 403 when user is not a member of the organization", async () => {
    mockSessionWithoutMembership()
    const res = await createApp().request("/protected")
    expect(res.status).toBe(403)
  })

  it("sets context and continues when auth is valid", async () => {
    mockAuthenticatedSession()
    const res = await createApp().request("/protected")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.organizationId).toBeDefined()
    expect(body.userId).toBeDefined()
  })
})
