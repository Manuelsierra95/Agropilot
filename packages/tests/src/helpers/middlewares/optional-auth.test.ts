import { Hono } from "hono"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { optionalAuth } from "@workspace/api/middlewares/optional-auth"
import {
  authMocks,
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../mock-session"

const createApp = () =>
  new Hono().use(optionalAuth).get("/optional", (c) =>
    c.json({
      userId: c.get("user")?.id ?? null,
      organizationId: c.get("organizationId"),
    })
  )

describe("optionalAuth", () => {
  beforeEach(() => {
    mockUnauthenticated()
  })

  it("continues without user when session is missing", async () => {
    const res = await createApp().request("/optional")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.userId).toBeNull()
    expect(body.organizationId).toBeNull()
  })

  it("sets user context when session exists", async () => {
    mockAuthenticatedSession()
    const res = await createApp().request("/optional")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.userId).toBeTruthy()
    expect(body.organizationId).toBeTruthy()
  })

  it("clears context when getSession throws", async () => {
    authMocks.getSession.mockRejectedValue(new Error("auth unavailable"))
    const res = await createApp().request("/optional")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.userId).toBeNull()
  })
})
