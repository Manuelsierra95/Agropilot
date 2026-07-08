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

vi.mock("@workspace/api/services/auth", () => ({
  getActiveOrganization: orgMocks.getActiveOrganization,
  getOrganizationMembers: orgMocks.getOrganizationMembers,
  getOrganizationMe: orgMocks.getOrganizationMe,
  updateOrganization: orgMocks.updateOrganization,
  listInvitations: orgMocks.listInvitations,
  createInvitation: orgMocks.createInvitation,
  bulkCreateInvitations: orgMocks.bulkCreateInvitations,
  cancelInvitation: orgMocks.cancelInvitation,
}))

import { app } from "@workspace/api/app"
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
    const body = await res.json()
    expect(body.meta.scope).toBe("organization")
    expect(body.data.organization.id).toBe("org-1")
  })

  it("GET /organization/members returns members", async () => {
    mockAuthenticatedSession("member")
    orgMocks.getOrganizationMembers.mockResolvedValue([{ id: "m-1" }])

    const res = await apiRequest(app, "/api/v1/organization/members")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.members).toHaveLength(1)
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
    const body = await res.json()
    expect(body.data.organization.name).toBe("Nueva finca")
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
    const body = await res.json()
    expect(body.data.invitation.id).toBe("inv-1")
  })

  it("POST /organization/invitations returns 403 for non-admin", async () => {
    mockAuthenticatedSession("member")

    const res = await apiRequest(app, "/api/v1/organization/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nuevo@agropilot.dev",
        role: "member",
      }),
    })

    expect(res.status).toBe(403)
  })

  it("GET /organization/invitations returns invitations for admin", async () => {
    mockAuthenticatedSession("admin")
    orgMocks.listInvitations.mockResolvedValue([
      { id: "inv-1", email: "a@test.com", status: "pending" },
    ])

    const res = await apiRequest(app, "/api/v1/organization/invitations")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.invitations).toHaveLength(1)
  })

  it("GET /organization/invitations returns 403 for non-admin", async () => {
    mockAuthenticatedSession("member")

    const res = await apiRequest(app, "/api/v1/organization/invitations")
    expect(res.status).toBe(403)
  })

  it("POST /organization/invitations/bulk creates multiple invitations", async () => {
    mockAuthenticatedSession("admin")
    orgMocks.bulkCreateInvitations.mockResolvedValue({
      invitations: [{ id: "inv-1" }, { id: "inv-2" }],
      failed: [],
      count: 2,
    })

    const res = await apiRequest(app, "/api/v1/organization/invitations/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invitations: [
          { email: "a@test.com", role: "member" },
          { email: "b@test.com", role: "viewer" },
        ],
      }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.count).toBe(2)
  })

  it("DELETE /organization/invitations/:id cancels invitation for admin", async () => {
    mockAuthenticatedSession("admin")
    orgMocks.cancelInvitation.mockResolvedValue(undefined)

    const res = await apiRequest(app, "/api/v1/organization/invitations/inv-1", {
      method: "DELETE",
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe("inv-1")
  })
})
