import { Hono } from "hono"
import { beforeEach, describe, expect, it } from "vitest"

import { requireRole } from "@/middlewares/require-role"
import { testMember } from "../helpers/fixtures"

const createApp = (role: string) =>
  new Hono()
    .use(async (c, next) => {
      c.set("member", testMember(role))
      await next()
    })
    .use(requireRole("admin"))
    .get("/admin", (c) => c.json({ ok: true }))

describe("requireRole", () => {
  beforeEach(() => {})

  it("returns 401 when member is missing", async () => {
    const app = new Hono()
      .use(requireRole("admin"))
      .get("/admin", (c) => c.json({ ok: true }))

    const res = await app.request("/admin")
    expect(res.status).toBe(401)
  })

  it("returns 403 when role is below required level", async () => {
    const res = await createApp("member").request("/admin")
    expect(res.status).toBe(403)
  })

  it("allows access when role meets requirement", async () => {
    const res = await createApp("admin").request("/admin")
    expect(res.status).toBe(200)
  })

  it("allows owner to access admin routes", async () => {
    const res = await createApp("owner").request("/admin")
    expect(res.status).toBe(200)
  })
})
