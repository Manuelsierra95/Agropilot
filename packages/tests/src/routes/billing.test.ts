import { beforeEach, describe, expect, it, vi } from "vitest"

const billingMocks = vi.hoisted(() => ({
  getActiveOrganization: vi.fn(),
  getBillingMe: vi.fn(),
  toggleModule: vi.fn(),
}))

vi.mock("@workspace/api/services/auth", () => ({
  getActiveOrganization: billingMocks.getActiveOrganization,
}))

vi.mock("@workspace/api/services/billing", () => ({
  getBillingMe: billingMocks.getBillingMe,
  toggleModule: billingMocks.toggleModule,
}))

import { app } from "@workspace/api/app"
import { testMember } from "../helpers/fixtures"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { apiRequest } from "../helpers/request"

describe("billing routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticated()
  })

  it("GET /billing/me returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/billing/me")
    expect(res.status).toBe(401)
  })

  it("GET /billing/me returns 403 for non-owner", async () => {
    mockAuthenticatedSession("admin")
    const res = await apiRequest(app, "/api/v1/billing/me")
    expect(res.status).toBe(403)
  })

  it("GET /billing/me returns billing data for owner", async () => {
    mockAuthenticatedSession("owner")
    billingMocks.getActiveOrganization.mockResolvedValue({
      organization: { plan: "pro" },
      member: testMember("owner"),
    })
    billingMocks.getBillingMe.mockResolvedValue({ plan: "pro", modules: [] })

    const res = await apiRequest(app, "/api/v1/billing/me")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.meta.scope).toBe("organization")
  })

  it("POST /billing/portal returns 501", async () => {
    mockAuthenticatedSession("owner")
    const res = await apiRequest(app, "/api/v1/billing/portal", { method: "POST" })
    expect(res.status).toBe(501)
  })

  it("PATCH /billing/modules/:slug toggles module", async () => {
    mockAuthenticatedSession("owner")
    billingMocks.toggleModule.mockResolvedValue(undefined)

    const res = await apiRequest(app, "/api/v1/billing/modules/ai-analysis", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.success).toBe(true)
  })
})
