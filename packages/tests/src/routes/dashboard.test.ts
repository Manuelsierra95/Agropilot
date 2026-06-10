import { beforeEach, describe, expect, it, vi } from "vitest"

const dashboardMocks = vi.hoisted(() => ({
  getDashboardOverview: vi.fn(),
}))

vi.mock("@/services/dashboard", () => dashboardMocks)

import { app } from "api/app"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { apiRequest } from "../helpers/request"

const mockOverview = {
  olivePrices: [{ name: "Virgen Extra", price: 5.42, history: [] }],
  sellingWindow: {
    lonjaPrice: 5.42,
    costPerKg: 3.8,
    estimatedKg: 1000,
  },
  olivar: { name: "La Mata" },
  finance: { transactions: [] },
  campaignMargin: { campaignStart: "2025-10-01", points: [] },
  recommendations: { recommendations: [] },
  risks: {},
  mapParcels: [],
  recentEvents: [],
  productionValue: {
    monthlyProductionKg: Array(12).fill(0),
    prevMonthlyProductionKg: Array(12).fill(0),
    lonjaPrice: 5.42,
    numOlivos: 100,
    campaignStartYear: 2025,
  },
}

describe("dashboard routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticated()
  })

  it("GET /dashboard/overview returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/dashboard/overview")
    expect(res.status).toBe(401)
  })

  it("GET /dashboard/overview returns overview payload", async () => {
    mockAuthenticatedSession()
    dashboardMocks.getDashboardOverview.mockResolvedValue(mockOverview)

    const res = await apiRequest(app, "/api/v1/dashboard/overview")
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.overview.olivePrices).toHaveLength(1)
    expect(body.overview.finance.transactions).toEqual([])
    expect(dashboardMocks.getDashboardOverview).toHaveBeenCalledWith(
      expect.any(String),
      {}
    )
  })

  it("GET /dashboard/overview forwards query filters to service", async () => {
    mockAuthenticatedSession()
    dashboardMocks.getDashboardOverview.mockResolvedValue(mockOverview)

    const parcelId = "22222222-2222-4222-8222-222222222222"
    const campaignId = "11111111-1111-4111-8111-111111111111"
    const res = await apiRequest(
      app,
      `/api/v1/dashboard/overview?parcelId=${parcelId}&campaignId=${campaignId}&from=2025-01-01&to=2025-12-31`
    )
    expect(res.status).toBe(200)
    expect(dashboardMocks.getDashboardOverview).toHaveBeenCalledWith(
      expect.any(String),
      {
        parcelId,
        campaignId,
        from: "2025-01-01",
        to: "2025-12-31",
      }
    )
  })

  it("GET /dashboard/overview returns 400 for invalid query", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(
      app,
      "/api/v1/dashboard/overview?parcelId=invalid"
    )
    expect(res.status).toBe(400)
  })
})
