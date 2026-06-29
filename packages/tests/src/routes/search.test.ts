import { beforeEach, describe, expect, it, vi } from "vitest"

const searchMocks = vi.hoisted(() => ({
  getProvinces: vi.fn(),
  getMunicipalities: vi.fn(),
  getStreets: vi.fn(),
  searchByAddress: vi.fn(),
  searchByCoords: vi.fn(),
  searchByRefcat: vi.fn(),
  fetchPolygon: vi.fn(),
}))

vi.mock("@workspace/api/services/search", () => searchMocks)

import { app } from "@workspace/api/app"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { apiRequest } from "../helpers/request"

describe("search routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticated()
  })

  it("GET /search/provinces returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/search/provinces")
    expect(res.status).toBe(401)
  })

  it("GET /search/provinces returns provinces", async () => {
    mockAuthenticatedSession()
    searchMocks.getProvinces.mockResolvedValue([{ code: "23", name: "Jaén" }])

    const res = await apiRequest(app, "/api/v1/search/provinces")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toHaveLength(1)
  })

  it("GET /search/municipalities validates query", async () => {
    mockAuthenticatedSession()
    const res = await apiRequest(app, "/api/v1/search/municipalities")
    expect(res.status).toBe(400)
  })

  it("GET /search/address returns 400 on search error", async () => {
    mockAuthenticatedSession()
    searchMocks.searchByAddress.mockRejectedValue(new Error("not found"))

    const res = await apiRequest(
      app,
      "/api/v1/search/address?province=23&municipality=099&streetSigla=CL&streetName=MAYOR&number=1"
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("not found")
  })

  it("GET /search/refcat/:refcat returns data", async () => {
    mockAuthenticatedSession()
    searchMocks.searchByRefcat.mockResolvedValue({ refcat: "123" })

    const res = await apiRequest(app, "/api/v1/search/refcat/1234567890AB1234D")
    expect(res.status).toBe(200)
  })
})
