import { beforeEach, describe, expect, it, vi } from "vitest"

const parcelMocks = vi.hoisted(() => ({
  listParcels: vi.fn(),
  getParcelById: vi.fn(),
  createParcel: vi.fn(),
  updateParcel: vi.fn(),
  deleteParcel: vi.fn(),
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
})
