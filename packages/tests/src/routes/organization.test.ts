import { beforeEach, describe, expect, it, vi } from "vitest"

const orgMocks = vi.hoisted(() => ({
  getActiveOrganization: vi.fn(),
  getOrganizationMembers: vi.fn(),
  getOrganizationMe: vi.fn(),
  updateOrganization: vi.fn(),
  listInvitations: vi.fn(),
  createInvitation: vi.fn(),
  bulkCreateInvitations: vi.fn(),
  cancelInvitation: vi.fn(),
}))

vi.mock("@/services/organization", () => ({
  getActiveOrganization: orgMocks.getActiveOrganization,
  getOrganizationMembers: orgMocks.getOrganizationMembers,
  getOrganizationMe: orgMocks.getOrganizationMe,
  updateOrganization: orgMocks.updateOrganization,
}))

vi.mock("@/services/invitations", () => ({
  listInvitations: orgMocks.listInvitations,
  createInvitation: orgMocks.createInvitation,
  bulkCreateInvitations: orgMocks.bulkCreateInvitations,
  cancelInvitation: orgMocks.cancelInvitation,
}))

import { app } from "api/app"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { apiRequest } from "../helpers/request"

describe("organization routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticated()
  })

  it("GET /organization/active returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/organization/active")
    expect(res.status).toBe(401)
  })

  it("GET /organization/active returns organization context", async () => {
    mockAuthenticatedSession()
    orgMocks.getActiveOrganization.mockResolvedValue({
      organization: { id: "org-1", name: "Finca Demo" },
    })

    const res = await apiRequest(app, "/api/v1/organization/active")
    expect(res.status).toBe(200)
  })

  it("GET /organization/members returns members", async () => {
    mockAuthenticatedSession("member")
    orgMocks.getOrganizationMembers.mockResolvedValue([{ id: "m-1" }])

    const res = await apiRequest(app, "/api/v1/organization/members")
    expect(res.status).toBe(200)
  })

  it("PUT /organization/name returns 403 for non-admin", async () => {
    mockAuthenticatedSession("member")

    const res = await apiRequest(app, "/api/v1/organization/name", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Nueva finca" }),
    })

    expect(res.status).toBe(403)
  })

  it("PUT /organization/name updates name for admin", async () => {
    mockAuthenticatedSession("admin")
    orgMocks.updateOrganization.mockResolvedValue({ name: "Nueva finca" })

    const res = await apiRequest(app, "/api/v1/organization/name", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Nueva finca" }),
    })

    expect(res.status).toBe(200)
  })

  it("POST /organization/invitations creates invitation for admin", async () => {
    mockAuthenticatedSession("admin")
    orgMocks.createInvitation.mockResolvedValue({ id: "inv-1" })

    const res = await apiRequest(app, "/api/v1/organization/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nuevo@agropilot.dev",
        role: "member",
      }),
    })

    expect(res.status).toBe(201)
  })
})
