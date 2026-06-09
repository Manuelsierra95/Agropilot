import { describe, expect, it } from "vitest"

import { app } from "api/app"
import { apiRequest } from "../helpers/request"

describe("GET /healthz", () => {
  it("returns OK", async () => {
    const res = await apiRequest(app, "/api/v1/healthz")
    expect(res.status).toBe(200)
    expect(await res.text()).toBe("OK")
  })
})
