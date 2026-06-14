import { beforeEach, describe, expect, it, vi } from "vitest"

const parcelMocks = vi.hoisted(() => ({
  listParcels: vi.fn(),
  getParcelById: vi.fn(),
  createParcel: vi.fn(),
  updateParcel: vi.fn(),
  deleteParcel: vi.fn(),
  getParcelsForMap: vi.fn(),
  getParcelRecommendations: vi.fn(),
  getParcelRisks: vi.fn(),
  getParcelCropOverview: vi.fn(),
  getParcelsCropOverviewsForDashboard: vi.fn(),
  getParcelsRecommendationsForDashboard: vi.fn(),
  getParcelsRisksForDashboard: vi.fn(),
}))

vi.mock("@/services/parcel", () => parcelMocks)

import { app } from "api/app"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { apiRequest } from "../helpers/request"

describe("parcel routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticated()
  })

  it("GET /parcel returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/parcel")
    expect(res.status).toBe(401)
  })

  it("GET /parcel returns parcels", async () => {
    mockAuthenticatedSession()
    parcelMocks.listParcels.mockResolvedValue([{ id: "p-1", name: "La Mata" }])

    const res = await apiRequest(app, "/api/v1/parcel")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.parcels).toHaveLength(1)
  })

  it("POST /parcel creates a parcel", async () => {
    mockAuthenticatedSession()
    parcelMocks.createParcel.mockResolvedValue({ id: "p-new", name: "Nueva" })

    const res = await apiRequest(app, "/api/v1/parcel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Nueva",
        cropType: "olivo",
        irrigationType: "dryland",
      }),
    })

    expect(res.status).toBe(201)
  })

  it("POST /parcel returns 400 for invalid payload", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/parcel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", cropType: "" }),
    })

    expect(res.status).toBe(400)
  })

  it("PUT /parcel/:id updates a parcel", async () => {
    mockAuthenticatedSession()
    parcelMocks.updateParcel.mockResolvedValue({ id: "p-1" })

    const res = await apiRequest(app, "/api/v1/parcel/p-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Actualizada" }),
    })

    expect(res.status).toBe(200)
  })

  it("DELETE /parcel/:id deletes a parcel", async () => {
    mockAuthenticatedSession()
    parcelMocks.deleteParcel.mockResolvedValue(undefined)

    const res = await apiRequest(app, "/api/v1/parcel/p-1", { method: "DELETE" })
    expect(res.status).toBe(200)
  })

  it("GET /parcel/map returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/parcel/map")
    expect(res.status).toBe(401)
  })

  it("GET /parcel/map returns map parcels", async () => {
    mockAuthenticatedSession()
    parcelMocks.getParcelsForMap.mockResolvedValue([{ id: "p-1", name: "La Mata" }])

    const res = await apiRequest(app, "/api/v1/parcel/map")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.mapParcels).toHaveLength(1)
  })

  it("GET /parcel/:id/recommendations returns recommendations", async () => {
    mockAuthenticatedSession()
    parcelMocks.getParcelRecommendations.mockResolvedValue([])

    const res = await apiRequest(app, "/api/v1/parcel/p-1/recommendations")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.recommendations).toEqual([])
  })

  it("GET /parcel/:id/risks returns risks", async () => {
    mockAuthenticatedSession()
    parcelMocks.getParcelRisks.mockResolvedValue({
      waterStress: { level: "low", score: 0.25, reasons: [] },
      fungalRisk: { level: "low", score: 0.25, reasons: [] },
      insectRisk: { level: "low", score: 0.25, reasons: [] },
      thermalStress: { level: "low", score: 0.25, reasons: [] },
    })

    const res = await apiRequest(app, "/api/v1/parcel/p-1/risks")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.risks.waterStress.level).toBe("low")
  })

  it("GET /parcel/:id/crop-overview returns olivar data", async () => {
    mockAuthenticatedSession()
    parcelMocks.getParcelCropOverview.mockResolvedValue({ name: "La Mata" })

    const res = await apiRequest(app, "/api/v1/parcel/p-1/crop-overview")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.olivar.name).toBe("La Mata")
  })

  it("GET /parcel/crop-overviews returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/parcel/crop-overviews")
    expect(res.status).toBe(401)
  })

  it("GET /parcel/crop-overviews returns bulk crop overviews", async () => {
    mockAuthenticatedSession()
    parcelMocks.getParcelsCropOverviewsForDashboard.mockResolvedValue({
      parcels: [
        {
          parcelId: "p-1",
          name: "La Mata",
          coordinates: { lat: 38, lng: -3.37 },
          stationId: "—",
          cropType: "olivo",
          area: 10,
          lastUpdate: "2026-01-01T00:00:00.000Z",
          temperature: 20,
          temperatureChange: 0,
          phenologicalStage: "Vegetativo",
          gdd: 100,
          gddTarget: 3000,
          kc: 0.5,
          waterBalance: 0,
          estimatedProfitability: 0,
          participants: 1,
          pendingTasks: 0,
          completedTasks: 0,
          totalTrees: 2000,
          totalYieldKg: 0,
          aiInsight: "",
        },
      ],
    })

    const res = await apiRequest(app, "/api/v1/parcel/crop-overviews")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.cropOverviews.parcels).toHaveLength(1)
  })

  it("GET /parcel/parcels-recommendations returns bulk recommendations", async () => {
    mockAuthenticatedSession()
    parcelMocks.getParcelsRecommendationsForDashboard.mockResolvedValue({
      parcels: [{ parcelId: "p-1", name: "La Mata", recommendations: [] }],
    })

    const res = await apiRequest(app, "/api/v1/parcel/parcels-recommendations")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.parcelsRecommendations.parcels).toHaveLength(1)
  })

  it("GET /parcel/parcels-risks returns bulk risks", async () => {
    mockAuthenticatedSession()
    parcelMocks.getParcelsRisksForDashboard.mockResolvedValue({
      parcels: [
        {
          parcelId: "p-1",
          name: "La Mata",
          risks: {
            waterStress: { level: "low", score: 0.25, reasons: [] },
            fungalRisk: { level: "low", score: 0.25, reasons: [] },
            insectRisk: { level: "low", score: 0.25, reasons: [] },
            thermalStress: { level: "low", score: 0.25, reasons: [] },
          },
        },
      ],
    })

    const res = await apiRequest(app, "/api/v1/parcel/parcels-risks")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.parcelsRisks.parcels).toHaveLength(1)
  })
})
