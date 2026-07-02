import { beforeEach, describe, expect, it, vi } from "vitest"

const financeMocks = vi.hoisted(() => ({
  getOlivePricesForDashboard: vi.fn(),
  getSellingWindowForDashboard: vi.fn(),
  getFinanceResumeForDashboard: vi.fn(),
  getCampaignMarginForDashboard: vi.fn(),
  getRecentTransactionsForDashboard: vi.fn(),
  getProductionValueForDashboard: vi.fn(),
  getParcelsFinanceComparisonForDashboard: vi.fn(),
  getParcelsSellingWindowsForDashboard: vi.fn(),
}))

const parcelMocks = vi.hoisted(() => ({
  getParcelsForMap: vi.fn(),
  getParcelRecommendations: vi.fn(),
  getParcelWeather: vi.fn(),
  getParcelCropOverview: vi.fn(),
  getParcelsCropOverviewsForDashboard: vi.fn(),
  getParcelsRecommendationsForDashboard: vi.fn(),
  getParcelsRisksForDashboard: vi.fn(),
}))

const taskMocks = vi.hoisted(() => ({
  listUpcomingWeekTasks: vi.fn(),
}))

vi.mock("@workspace/api/services/finance", () => financeMocks)
vi.mock("@workspace/api/services/parcels", () => parcelMocks)
vi.mock("@workspace/api/services/tasks", () => taskMocks)

import { app } from "@workspace/api/app"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { apiRequest } from "../helpers/request"

const PARCEL_ID = "a3f1c2d4-0000-4000-8000-000000000001"
const RISKS = {
  waterStress: { level: "low", score: 0.2, reasons: [] },
  fungalRisk: { level: "low", score: 0.1, reasons: [] },
  insectRisk: { level: "low", score: 0.1, reasons: [] },
  thermalStress: { level: "low", score: 0.1, reasons: [] },
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

  it("GET /dashboard/overview returns 400 when from is sent without to", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(
      app,
      "/api/v1/dashboard/overview?from=2026-01-01"
    )
    expect(res.status).toBe(400)
  })

  it("GET /dashboard/overview returns the single-parcel variant when parcelId is present", async () => {
    mockAuthenticatedSession()

    financeMocks.getOlivePricesForDashboard.mockResolvedValue([
      { name: "Extra", price: 5.4 },
    ])
    financeMocks.getSellingWindowForDashboard.mockResolvedValue({
      lonjaPrice: 5.42,
      costPerKg: 3.8,
      estimatedKg: 1000,
    })
    financeMocks.getProductionValueForDashboard.mockResolvedValue({
      monthlyProductionKg: Array(12).fill(0),
      prevMonthlyProductionKg: Array(12).fill(0),
      lonjaPrice: 5,
      numOlivos: 100,
      campaignStartYear: 2026,
    })
    financeMocks.getFinanceResumeForDashboard.mockResolvedValue({
      transactions: [],
    })
    financeMocks.getCampaignMarginForDashboard.mockResolvedValue({
      campaignStart: "2026-01-01",
      points: [],
    })
    financeMocks.getRecentTransactionsForDashboard.mockResolvedValue([])

    parcelMocks.getParcelCropOverview.mockResolvedValue({
      name: "La Mata",
      lastUpdate: new Date("2026-06-01T00:00:00Z").toISOString(),
    })
    parcelMocks.getParcelRecommendations.mockResolvedValue([
      {
        id: "rec-00000000-0000-4000-8000-000000000001",
        type: "irrigation",
        priority: "high",
        message: "m",
        details: "d",
      },
    ])
    parcelMocks.getParcelWeather.mockResolvedValue({
      data: { risks: RISKS },
    })
    parcelMocks.getParcelsForMap.mockResolvedValue([])

    taskMocks.listUpcomingWeekTasks.mockResolvedValue([])

    const res = await apiRequest(
      app,
      `/api/v1/dashboard/overview?parcelId=${PARCEL_ID}`
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.meta.scope).toBe("parcel")
    expect(body.meta.parcelId).toBe(PARCEL_ID)
    expect(body.data.market.sellingWindow.lonjaPrice).toBe(5.42)
    expect(body.data.crop.overview.name).toBe("La Mata")
    expect(body.data.intelligence.risks).toEqual(RISKS)
    expect(body.data.finance.resume.transactions).toEqual([])
    expect(body.data.operations.parcelsMap).toEqual([])

    expect(financeMocks.getParcelsSellingWindowsForDashboard).not.toHaveBeenCalled()
    expect(financeMocks.getParcelsFinanceComparisonForDashboard).not.toHaveBeenCalled()
    expect(parcelMocks.getParcelsCropOverviewsForDashboard).not.toHaveBeenCalled()
    expect(parcelMocks.getParcelsRecommendationsForDashboard).not.toHaveBeenCalled()
    expect(parcelMocks.getParcelsRisksForDashboard).not.toHaveBeenCalled()
  })

  it("GET /dashboard/overview returns the all-parcels variant when no parcelId", async () => {
    mockAuthenticatedSession()

    financeMocks.getOlivePricesForDashboard.mockResolvedValue([])
    financeMocks.getProductionValueForDashboard.mockResolvedValue({
      monthlyProductionKg: Array(12).fill(0),
      prevMonthlyProductionKg: Array(12).fill(0),
      lonjaPrice: 5,
      numOlivos: 100,
      campaignStartYear: 2026,
    })
    financeMocks.getRecentTransactionsForDashboard.mockResolvedValue([])
    financeMocks.getParcelsSellingWindowsForDashboard.mockResolvedValue({
      parcels: [
        {
          parcelId: PARCEL_ID,
          name: "P1",
          lonjaPrice: 5,
          costPerKg: 3,
          estimatedKg: 100,
        },
      ],
    })
    financeMocks.getParcelsFinanceComparisonForDashboard.mockResolvedValue({
      parcels: [
        {
          parcelId: PARCEL_ID,
          name: "P1",
          income: 100,
          expense: 50,
          profit: 50,
          totalKg: 1000,
        },
      ],
    })

    parcelMocks.getParcelsCropOverviewsForDashboard.mockResolvedValue({
      parcels: [{ parcelId: PARCEL_ID, name: "P1" }],
    })
    parcelMocks.getParcelsRecommendationsForDashboard.mockResolvedValue({
      parcels: [
        {
          parcelId: PARCEL_ID,
          name: "P1",
          recommendations: [
            {
              id: "rec-00000000-0000-4000-8000-000000000002",
              type: "t",
              priority: "low",
              message: "low-rec",
              details: "d",
            },
            {
              id: "rec-00000000-0000-4000-8000-000000000003",
              type: "t2",
              priority: "high",
              message: "high-rec",
              details: "d",
            },
          ],
        },
      ],
    })
    parcelMocks.getParcelsRisksForDashboard.mockResolvedValue({
      parcels: [{ parcelId: PARCEL_ID, name: "P1", risks: RISKS }],
    })
    parcelMocks.getParcelsForMap.mockResolvedValue([])

    taskMocks.listUpcomingWeekTasks.mockResolvedValue([])

    const res = await apiRequest(app, "/api/v1/dashboard/overview")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.meta.scope).toBe("organization")
    expect(body.data.market.allSellingWindows).toHaveLength(1)
    expect(body.data.market.allSellingWindows[0].parcelId).toBe(PARCEL_ID)
    expect(body.data.crop.allOverviews).toHaveLength(1)
    expect(body.data.finance.comparison.parcels).toHaveLength(1)

    expect(body.data.intelligence.allRecommendations).toHaveLength(2)
    expect(body.data.intelligence.allRecommendations[0].priority).toBe("high")
    expect(body.data.intelligence.allRecommendations[0].parcelId).toBe(PARCEL_ID)
    expect(body.data.intelligence.allRecommendations[0].parcelName).toBe("P1")

    expect(body.data.intelligence.allRisks).toHaveLength(1)
    expect(body.data.intelligence.allRisks[0]).toEqual({
      parcelId: PARCEL_ID,
      name: "P1",
      risks: RISKS,
    })

    expect(financeMocks.getSellingWindowForDashboard).not.toHaveBeenCalled()
    expect(financeMocks.getFinanceResumeForDashboard).not.toHaveBeenCalled()
    expect(financeMocks.getCampaignMarginForDashboard).not.toHaveBeenCalled()
    expect(parcelMocks.getParcelCropOverview).not.toHaveBeenCalled()
    expect(parcelMocks.getParcelWeather).not.toHaveBeenCalled()
    expect(parcelMocks.getParcelRecommendations).not.toHaveBeenCalled()
  })
})
