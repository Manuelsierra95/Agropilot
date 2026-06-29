import { beforeEach, describe, expect, it, vi } from "vitest"

const campaignMocks = vi.hoisted(() => ({
  listCampaignsForSwitcher: vi.fn(),
}))

vi.mock("@workspace/api/services/campaigns", () => campaignMocks)

import { app } from "@workspace/api/app"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { apiRequest } from "../helpers/request"

const mockCampaigns = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Campaña 2025–26",
    startDate: "2025-10-01",
    endDate: "2026-09-30",
    status: "active" as const,
    balance: 29540,
  },
]

describe("campaign routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticated()
  })

  it("GET /campaign returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/campaign")
    expect(res.status).toBe(401)
  })

  it("GET /campaign returns campaigns payload", async () => {
    mockAuthenticatedSession()
    campaignMocks.listCampaignsForSwitcher.mockResolvedValue(mockCampaigns)

    const res = await apiRequest(app, "/api/v1/campaign")
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.meta.scope).toBe("organization")
    expect(body.data.campaigns).toHaveLength(1)
    expect(body.data.campaigns[0].name).toBe("Campaña 2025–26")
    expect(campaignMocks.listCampaignsForSwitcher).toHaveBeenCalledWith(undefined)
  })

  it("GET /campaign forwards parcelId query param", async () => {
    mockAuthenticatedSession()
    campaignMocks.listCampaignsForSwitcher.mockResolvedValue(mockCampaigns)

    const parcelId = "22222222-2222-4222-8222-222222222222"
    const res = await apiRequest(
      app,
      `/api/v1/campaign?parcelId=${parcelId}`
    )
    expect(res.status).toBe(200)
    expect(campaignMocks.listCampaignsForSwitcher).toHaveBeenCalledWith(parcelId)
  })

  it("GET /campaign returns 400 for invalid parcelId", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/campaign?parcelId=not-a-uuid")
    expect(res.status).toBe(400)
  })
})
