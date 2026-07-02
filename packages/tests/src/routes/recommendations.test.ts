import { beforeEach, describe, expect, it, vi } from "vitest"

const recommendationMocks = vi.hoisted(() => ({
  listActiveRecommendations: vi.fn(),
  acceptRecommendation: vi.fn(),
  dismissRecommendation: vi.fn(),
  mapRecommendationToDashboard: vi.fn((rec: {
    id: string
    type: string
    priority: string
    title: string
    details: string
  }) => ({
    id: rec.id,
    type: rec.type,
    priority: rec.priority,
    message: rec.title,
    details: rec.details,
  })),
}))

vi.mock("@workspace/api/services/recommendations", () => recommendationMocks)

import { app } from "@workspace/api/app"
import { TEST_ORG_ID } from "../helpers/fixtures"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { apiRequest } from "../helpers/request"

const sampleRecommendation = {
  id: "rec-00000000-0000-4000-8000-000000000001",
  organizationId: TEST_ORG_ID,
  parcelId: "p-1",
  dedupeKey: "seed:test",
  type: "irrigation" as const,
  source: "weather" as const,
  title: "Revisar riego",
  details: "Déficit hídrico moderado",
  priority: "high" as const,
  status: "pending" as const,
  expiresAt: new Date("2026-12-31T23:59:59.999Z"),
  acceptedAt: null,
  dismissedAt: null,
  meta: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  parcelName: "La Mata",
}

describe("recommendations routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticated()
  })

  it("GET /recommendations returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/recommendations")
    expect(res.status).toBe(401)
  })

  it("GET /recommendations returns active recommendations", async () => {
    mockAuthenticatedSession()
    recommendationMocks.listActiveRecommendations.mockResolvedValue([
      sampleRecommendation,
    ])

    const res = await apiRequest(app, "/api/v1/recommendations?parcelId=p-1")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.recommendations).toHaveLength(1)
    expect(body.data.recommendations[0].id).toBe(sampleRecommendation.id)
    expect(recommendationMocks.listActiveRecommendations).toHaveBeenCalledWith(
      TEST_ORG_ID,
      expect.objectContaining({ parcelId: "p-1", status: "pending" })
    )
  })

  it("POST /recommendations/:id/accept creates task and accepts recommendation", async () => {
    mockAuthenticatedSession()
    recommendationMocks.acceptRecommendation.mockResolvedValue({
      task: {
        id: "task-1",
        recommendationId: sampleRecommendation.id,
        title: "Revisar riego",
      },
      recommendation: { ...sampleRecommendation, status: "accepted" },
    })

    const res = await apiRequest(
      app,
      `/api/v1/recommendations/${sampleRecommendation.id}/accept`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }
    )

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.task.id).toBe("task-1")
    expect(recommendationMocks.acceptRecommendation).toHaveBeenCalledWith(
      TEST_ORG_ID,
      sampleRecommendation.id,
      {}
    )
  })

  it("POST /recommendations/:id/dismiss dismisses recommendation", async () => {
    mockAuthenticatedSession()
    recommendationMocks.dismissRecommendation.mockResolvedValue({
      ...sampleRecommendation,
      status: "dismissed",
    })

    const res = await apiRequest(
      app,
      `/api/v1/recommendations/${sampleRecommendation.id}/dismiss`,
      { method: "POST" }
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.recommendation.status).toBe("dismissed")
  })
})
