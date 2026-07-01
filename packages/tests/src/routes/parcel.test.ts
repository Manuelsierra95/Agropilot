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
  getParcelAgroclimateForDashboard: vi.fn(),
  getParcelsWeatherComparisonForDashboard: vi.fn(),
}))

vi.mock("@workspace/api/services/parcels", () => parcelMocks)

import { app } from "@workspace/api/app"
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
    expect(body.meta.scope).toBe("organization")
    expect(body.data.parcels).toHaveLength(1)
  })

  it("POST /parcel creates a parcel", async () => {
    mockAuthenticatedSession()
    parcelMocks.createParcel.mockResolvedValue({ id: "p-new", name: "Nueva" })

    const res = await apiRequest(app, "/api/v1/parcel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Nueva",
        cropType: "olive",
        irrigationType: "dryland",
      }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.meta.mode).toBe("full")
    expect(body.data.parcel.id).toBe("p-new")
  })

  it("POST /parcel accepts crop fields", async () => {
    mockAuthenticatedSession()
    parcelMocks.createParcel.mockResolvedValue({ id: "p-new", name: "Nueva" })

    const res = await apiRequest(app, "/api/v1/parcel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Nueva",
        cropType: "olive",
        irrigationType: "dryland",
        variety: "Picual",
        soilType: "Arcilloso",
        plantingDate: "2020-03-15T00:00:00.000Z",
        plantCount: 1200,
        data: { oliveCropType: "superintensive" },
      }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.parcel.id).toBe("p-new")
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
    const body = await res.json()
    expect(body.meta.parcelId).toBe("p-1")
  })

  it("PUT /parcel/:id accepts crop fields", async () => {
    mockAuthenticatedSession()
    parcelMocks.updateParcel.mockResolvedValue({ id: "p-1" })

    const res = await apiRequest(app, "/api/v1/parcel/p-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Actualizada",
        variety: "Picual",
        soilType: "Arcilloso",
        plantingDate: "2020-03-15T00:00:00.000Z",
        plantCount: 1200,
        data: { oliveCropType: "intensive" },
      }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.meta.parcelId).toBe("p-1")
  })

  it("DELETE /parcel/:id deletes a parcel", async () => {
    mockAuthenticatedSession()
    parcelMocks.deleteParcel.mockResolvedValue(undefined)

    const res = await apiRequest(app, "/api/v1/parcel/p-1", { method: "DELETE" })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe("p-1")
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
    expect(body.data.mapParcels).toHaveLength(1)
  })

  it("GET /parcel/:id/recommendations returns recommendations", async () => {
    mockAuthenticatedSession()
    parcelMocks.getParcelRecommendations.mockResolvedValue([])

    const res = await apiRequest(app, "/api/v1/parcel/p-1/recommendations")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.recommendations).toEqual([])
  })

  it("GET /parcel/:id/crop-overview returns olivar data", async () => {
    mockAuthenticatedSession()
    parcelMocks.getParcelCropOverview.mockResolvedValue({ name: "La Mata" })

    const res = await apiRequest(app, "/api/v1/parcel/p-1/crop-overview")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.olivar.name).toBe("La Mata")
  })

  it("GET /parcel/dashboard returns crop overviews via include", async () => {
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

    const res = await apiRequest(app, "/api/v1/parcel/dashboard?include=cropOverviews")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.meta.scope).toBe("organization")
    expect(body.data.cropOverviews.parcels).toHaveLength(1)
  })

  it("GET /parcel/dashboard returns recommendations via include", async () => {
    mockAuthenticatedSession()
    parcelMocks.getParcelsRecommendationsForDashboard.mockResolvedValue({
      parcels: [{ parcelId: "p-1", name: "La Mata", recommendations: [] }],
    })

    const res = await apiRequest(app, "/api/v1/parcel/dashboard?include=recommendations")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.recommendations.parcels).toHaveLength(1)
  })

  it("GET /parcel/dashboard returns risks via include", async () => {
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

    const res = await apiRequest(app, "/api/v1/parcel/dashboard?include=risks")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.risks.parcels).toHaveLength(1)
  })

  it("GET /parcel/:id/agroclimate returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/parcel/p-1/agroclimate")
    expect(res.status).toBe(401)
  })

  it("GET /parcel/:id/agroclimate returns agroclimate data", async () => {
    mockAuthenticatedSession()
    parcelMocks.getParcelAgroclimateForDashboard.mockResolvedValue({
      request: {
        parcelId: "p-1",
        coords: { lat: 38, lng: -3.37 },
        cropType: "olivo",
        cropName: "La Mata",
        days: 30,
      },
      summary: { stationId: "st-1", lastUpdate: "2026-01-01T00:00:00.000Z" },
      dataRange: { start: "2025-01-01", end: "2025-12-31" },
      daily: { data: [], recent: [] },
      metrics: {
        water: {
          deficit7d: 0,
          deficit15d: 0,
          deficit30d: 0,
          eto7d: 0,
          eto30d: 0,
        },
        temperature: {
          avg7d: 18,
          avg30d: 17,
          trend: 1,
          heatStressDays: 0,
          coldStressDays: 0,
        },
        rain: {
          rain7d: 10,
          rain30d: 40,
          trend: 2,
          dryDaysConsecutive: 0,
          dryDays7d: 1,
        },
        crop: {
          gdd: 500,
          gdd30d: 200,
          kc: 0.5,
          stage: "Vegetativo",
          isCritical: false,
        },
        environment: {
          humidityAvg7d: 30,
          humidityAvg30d: 28,
          variabilityIndex: 2,
        },
      },
      risks: {
        waterStress: { level: "low", score: 0.25, reasons: [] },
        fungalRisk: { level: "low", score: 0.25, reasons: [] },
        insectRisk: { level: "low", score: 0.25, reasons: [] },
        thermalStress: { level: "low", score: 0.25, reasons: [] },
      },
      units: {
        daily: {
          tempMin: "°C",
          tempMax: "°C",
          precipitation: "mm",
          waterBalance: "mm",
        },
        metrics: {
          water: {
            deficit7d: "mm",
            deficit15d: "mm",
            deficit30d: "mm",
            eto7d: "mm",
            eto30d: "mm",
          },
          temperature: {
            avg7d: "°C",
            avg30d: "°C",
            trend: "°C",
            heatStressDays: "días",
            coldStressDays: "días",
          },
          rain: {
            rain7d: "mm",
            rain30d: "mm",
            trend: "mm",
            dryDaysConsecutive: "días",
            dryDays7d: "días",
          },
          crop: { gdd: "°C·día", gdd30d: "°C·día", kc: "" },
          environment: {
            humidityAvg7d: "%",
            humidityAvg30d: "%",
            variabilityIndex: "",
          },
        },
        risks: { score: "0-1" },
      },
      recommendations: [],
    })

    const res = await apiRequest(app, "/api/v1/parcel/p-1/agroclimate")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.agroclimate.request.parcelId).toBe("p-1")
  })

  it("GET /parcel/:id/agroclimate returns 400 for invalid parcelId in scope", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(
      app,
      "/api/v1/parcel/p-1/agroclimate?parcelId=not-a-uuid"
    )
    expect(res.status).toBe(400)
  })

  it("GET /parcel/dashboard returns weather comparison via include", async () => {
    mockAuthenticatedSession()
    parcelMocks.getParcelsWeatherComparisonForDashboard.mockResolvedValue({
      parcels: [
        {
          name: "La Mata",
          area: 10,
          rain30d: 40,
          tempAvg: 18,
          waterDeficit30d: 5,
          dryDaysConsecutive: 2,
          heatStressDays: 1,
          waterStress: "low",
        },
      ],
    })

    const res = await apiRequest(app, "/api/v1/parcel/dashboard?include=weatherComparison")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.weatherComparison.parcels).toHaveLength(1)
  })
})
