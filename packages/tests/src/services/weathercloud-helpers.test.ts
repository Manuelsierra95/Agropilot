import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import {
  scoreStation,
  getNearestWithRetry,
  getBestStations,
} from "@/services/weathercloud/helpers"

function makeDevice(overrides: Partial<{ code: string; name: string; latitude: string; longitude: string; elevation: string; data: string; values: any }> = {}) {
  return {
    code: "123456789",
    name: "Test Station",
    city: "Test City",
    latitude: "38.0",
    longitude: "-3.5",
    elevation: "420",
    account: 1,
    isFavorite: false,
    update: 60,
    image: "",
    type: "device",
    values: {
      epoch: 1234567890,
      bar: 1013,
      hum: 50,
      temp: 25,
      wspd: 2,
      wdir: 180,
    },
    data: "5",
    ...overrides,
  }
}

function mockFetch(devices: any[] | null) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve(devices ? { devices } : {}),
  })
}

describe("scoreStation", () => {
  it("returns higher score for more followers", () => {
    const scoreA = scoreStation(5, 100, 100, 50)
    const scoreB = scoreStation(5, 10, 100, 50)
    expect(scoreA).toBeGreaterThan(scoreB)
  })

  it("returns higher score for closer distance", () => {
    const scoreA = scoreStation(2, 50, 100, 50)
    const scoreB = scoreStation(20, 50, 100, 50)
    expect(scoreA).toBeGreaterThan(scoreB)
  })

  it("normalizes followers correctly", () => {
    const score = scoreStation(0, 50, 100, 50)
    expect(score).toBeCloseTo(0.7 * 0.5 + 0.3 * 1, 4)
  })

  it("handles maxFollowers = 0", () => {
    const score = scoreStation(5, 0, 0, 50)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })
})

describe("getNearestWithRetry", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns devices on first radius if available", async () => {
    vi.stubGlobal("fetch", mockFetch([makeDevice({ data: "3" })]))

    const result = await getNearestWithRetry(38.0, -3.5)
    expect(result.radiusUsed).toBe(5)
    expect(result.devices).toHaveLength(1)
  })

  it("retries with larger radius if first returns empty", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ devices: [makeDevice({ data: "8" })] }) })
    vi.stubGlobal("fetch", fetchMock)

    const result = await getNearestWithRetry(38.0, -3.5)
    expect(result.radiusUsed).toBe(10)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("throws after exhausting all radii", async () => {
    vi.stubGlobal("fetch", mockFetch(null))

    await expect(getNearestWithRetry(38.0, -3.5)).rejects.toThrow(
      "No weather stations found within 50km"
    )
  })
})

describe("getBestStations", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("selects station with best score as main", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            devices: [
              makeDevice({ code: "111111111", data: "10" }),
              makeDevice({ code: "222222222", data: "3" }),
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ followers: { number: 200 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ followers: { number: 10 } }),
      })
    vi.stubGlobal("fetch", fetchMock)

    const result = await getBestStations(38.0, -3.5)
    expect(result.main.code).toBe("111111111")
    expect(result.main.followers).toBe(200)
  })

  it("returns up to 2 fallbacks sorted by distance", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            devices: [
              makeDevice({ code: "111111111", data: "15" }),
              makeDevice({ code: "222222222", data: "3" }),
              makeDevice({ code: "333333333", data: "8" }),
              makeDevice({ code: "444444444", data: "20" }),
            ],
          }),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ followers: { number: 50 } }),
      })
    vi.stubGlobal("fetch", fetchMock)

    const result = await getBestStations(38.0, -3.5)
    expect(result.fallbacks).toHaveLength(2)
    expect(result.fallbacks[0]!.distance).toBeLessThan(result.fallbacks[1]!.distance)
  })

  it("handles followers fetch failure gracefully", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            devices: [
              makeDevice({ code: "111111111", data: "5" }),
              makeDevice({ code: "222222222", data: "10" }),
            ],
          }),
      })
      .mockRejectedValueOnce(new Error("API error"))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ followers: { number: 100 } }),
      })
    vi.stubGlobal("fetch", fetchMock)

    const result = await getBestStations(38.0, -3.5)
    expect(result.main.followers).toBe(100)
    expect(result.fallbacks[0]!.followers).toBe(0)
  })

  it("throws if no devices found", async () => {
    vi.stubGlobal("fetch", mockFetch(null))

    await expect(getBestStations(38.0, -3.5)).rejects.toThrow()
  })

  it("includes radiusUsed in result", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ devices: [makeDevice({ data: "8" })] }),
      })
    vi.stubGlobal("fetch", fetchMock)

    const result = await getBestStations(38.0, -3.5)
    expect(result.radiusUsed).toBe(10)
  })
})
