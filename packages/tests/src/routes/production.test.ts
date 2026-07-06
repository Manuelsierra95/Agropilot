import { beforeEach, describe, expect, it, vi } from "vitest"

const productionMocks = vi.hoisted(() => ({
  listHarvestDeliveries: vi.fn(),
  createHarvestDelivery: vi.fn(),
  createHarvestSale: vi.fn(),
}))

vi.mock("@workspace/api/services/production", () => productionMocks)

import { app } from "@workspace/api/app"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { apiRequest } from "../helpers/request"

describe("production routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticated()
  })

  it("GET /production/deliveries returns 401 without auth", async () => {
    const res = await apiRequest(
      app,
      "/api/v1/production/deliveries?parcelId=parcel-1"
    )
    expect(res.status).toBe(401)
  })

  it("GET /production/deliveries returns deliveries", async () => {
    mockAuthenticatedSession()
    productionMocks.listHarvestDeliveries.mockResolvedValue([
      {
        id: "delivery-1",
        parcelId: "parcel-1",
        parcelName: "Parcela A",
        quantityRemaining: 200,
        processedUnit: "l",
      },
    ])

    const res = await apiRequest(
      app,
      "/api/v1/production/deliveries?parcelId=parcel-1&status=stored,partial"
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.deliveries).toHaveLength(1)
    expect(body.data.deliveries[0].id).toBe("delivery-1")
  })

  it("POST /production/sales creates a harvest sale", async () => {
    mockAuthenticatedSession()
    productionMocks.createHarvestSale.mockResolvedValue({
      transaction: { id: "tx-new" },
      sales: [{ id: "sale-1" }],
    })

    const res = await apiRequest(app, "/api/v1/production/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parcelId: "parcel-1",
        saleDate: "2026-01-15",
        pricePerUnit: 5.5,
        deliveries: [{ deliveryId: "delivery-1", quantitySold: 50 }],
      }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.transaction.id).toBe("tx-new")
    expect(body.data.sales).toHaveLength(1)
  })

  it("POST /production/sales returns 400 for invalid payload", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/production/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parcelId: "parcel-1" }),
    })

    expect(res.status).toBe(400)
  })

  it("POST /production/deliveries returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/production/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parcelId: "parcel-1",
        deliveryDate: "2026-01-15",
        rawQuantity: 1000,
        rawUnit: "kg",
      }),
    })
    expect(res.status).toBe(401)
  })

  it("POST /production/deliveries creates a harvest delivery", async () => {
    mockAuthenticatedSession()
    productionMocks.createHarvestDelivery.mockResolvedValue({
      id: "delivery-new",
      parcelId: "parcel-1",
    })

    const res = await apiRequest(app, "/api/v1/production/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parcelId: "parcel-1",
        deliveryDate: "2026-01-15",
        rawQuantity: 1000,
        rawUnit: "kg",
        conversionRate: 20,
        processedUnit: "l",
      }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.delivery.id).toBe("delivery-new")
  })

  it("POST /production/deliveries returns 400 for invalid payload", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/production/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parcelId: "parcel-1" }),
    })

    expect(res.status).toBe(400)
  })
})
