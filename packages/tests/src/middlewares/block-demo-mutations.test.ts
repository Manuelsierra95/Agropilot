import { Hono } from "hono"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { DEMO_USER_ID } from "@workspace/auth/demo"

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
}))

vi.mock("@workspace/auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => authMocks.getSession(...args),
    },
  },
}))

import { blockDemoMutations } from "@workspace/api/middlewares/block-demo-mutations"

const createApp = () =>
  new Hono()
    .use(blockDemoMutations)
    .get("/read", (c) => c.json({ ok: true }))
    .post("/write", (c) => c.json({ ok: true }))

describe("blockDemoMutations", () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.stubEnv("DEMO_ENABLED", "true")
    authMocks.getSession.mockReset()
  })

  it("allows GET requests for demo user", async () => {
    authMocks.getSession.mockResolvedValue({
      user: { id: DEMO_USER_ID },
    })

    const res = await createApp().request("/read")
    expect(res.status).toBe(200)
  })

  it("blocks POST requests for demo user", async () => {
    authMocks.getSession.mockResolvedValue({
      user: { id: DEMO_USER_ID },
    })

    const res = await createApp().request("/write", { method: "POST" })
    expect(res.status).toBe(403)
  })

  it("allows POST requests for regular users", async () => {
    authMocks.getSession.mockResolvedValue({
      user: { id: "regular-user-id" },
    })

    const res = await createApp().request("/write", { method: "POST" })
    expect(res.status).toBe(200)
  })

  it("allows POST when demo mode is disabled", async () => {
    vi.stubEnv("DEMO_ENABLED", "false")
    authMocks.getSession.mockResolvedValue({
      user: { id: DEMO_USER_ID },
    })

    const res = await createApp().request("/write", { method: "POST" })
    expect(res.status).toBe(200)
  })
})
