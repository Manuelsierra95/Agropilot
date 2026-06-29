import { beforeEach, describe, expect, it, vi } from "vitest"

const userMocks = vi.hoisted(() => ({
  getUserMe: vi.fn(),
  updateUserOnboarding: vi.fn(),
}))

vi.mock("@workspace/api/services/auth", () => userMocks)

import { app } from "@workspace/api/app"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { apiRequest } from "../helpers/request"

describe("user routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticated()
  })

  it("GET /user/me returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/user/me")
    expect(res.status).toBe(401)
  })

  it("GET /user/me returns profile", async () => {
    mockAuthenticatedSession()
    userMocks.getUserMe.mockResolvedValue({
      id: "user-1",
      email: "test@agropilot.dev",
    })

    const res = await apiRequest(app, "/api/v1/user/me")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.email).toBe("test@agropilot.dev")
  })

  it("PATCH /user/me updates onboarding", async () => {
    mockAuthenticatedSession()
    userMocks.updateUserOnboarding.mockResolvedValue({
      onboardingStep: 2,
    })

    const res = await apiRequest(app, "/api/v1/user/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingStep: 2 }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.onboardingStep).toBe(2)
  })
})
