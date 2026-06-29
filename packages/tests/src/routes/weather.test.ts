import { beforeEach, describe, expect, it, vi } from "vitest"

const weatherMocks = vi.hoisted(() => ({
  getParcelWeatherForCalendar: vi.fn(),
}))

vi.mock("@workspace/api/services/weather", () => weatherMocks)

import { app } from "@workspace/api/app"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { apiRequest } from "../helpers/request"

const PARCEL_ID = "00000000-0000-4000-8000-000000000001"

describe("weather routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticated()
  })

  it("GET /weather returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/weather")
    expect(res.status).toBe(401)
  })

  it("GET /weather returns weather data for parcel", async () => {
    mockAuthenticatedSession()
    weatherMocks.getParcelWeatherForCalendar.mockResolvedValue({
      parcelId: PARCEL_ID,
      parcelName: "La Mata",
      current: {
        temperature: 22,
        humidity: 65,
        condition: "partly-cloudy",
      },
      forecast: [
        {
          date: "2026-06-15",
          condition: "sunny",
          tempMax: 24,
          tempMin: 14,
          humidity: 55,
        },
      ],
    })

    const res = await apiRequest(app, `/api/v1/weather?parcelId=${PARCEL_ID}`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.meta.scope).toBe("parcel")
    expect(body.data.weather.parcelName).toBe("La Mata")
    expect(body.data.weather.forecast).toHaveLength(1)
    expect(weatherMocks.getParcelWeatherForCalendar).toHaveBeenCalledWith(
      expect.any(String),
      PARCEL_ID,
      expect.any(Object)
    )
  })

  it("GET /weather returns null when no parcelId", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/weather")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.weather).toBeNull()
  })

  it("GET /weather returns empty forecast when no data", async () => {
    mockAuthenticatedSession()
    weatherMocks.getParcelWeatherForCalendar.mockResolvedValue({
      parcelId: PARCEL_ID,
      parcelName: "La Mata",
      current: null,
      forecast: [],
    })

    const res = await apiRequest(app, `/api/v1/weather?parcelId=${PARCEL_ID}`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.weather.current).toBeNull()
    expect(body.data.weather.forecast).toEqual([])
  })

  it("GET /weather returns 404 for unknown parcel", async () => {
    mockAuthenticatedSession()
    const { HTTPException } = await import("hono/http-exception")
    weatherMocks.getParcelWeatherForCalendar.mockRejectedValue(
      new HTTPException(404, { message: "Parcel not found" })
    )

    const res = await apiRequest(app, `/api/v1/weather?parcelId=${PARCEL_ID}`)
    expect(res.status).toBe(404)
  })

  it("GET /weather returns 400 for invalid parcelId", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/weather?parcelId=not-a-uuid")
    expect(res.status).toBe(400)
    expect(weatherMocks.getParcelWeatherForCalendar).not.toHaveBeenCalled()
  })
})
