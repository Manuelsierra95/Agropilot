import { describe, expect, it } from "vitest"
import { apiResponse } from "@workspace/api/lib/api-response"

describe("apiResponse", () => {
  it("builds response with meta and data", () => {
    const result = apiResponse({
      data: { parcels: [{ id: "1" }] },
      meta: { scope: "organization", mode: "preview" },
    })

    expect(result).toEqual({
      meta: { scope: "organization", mode: "preview" },
      data: { parcels: [{ id: "1" }] },
    })
  })

  it("includes pagination when provided", () => {
    const result = apiResponse({
      data: { items: [] },
      meta: { scope: "parcel", mode: "full", parcelId: "p-1" },
      pagination: { nextCursor: "abc-123", total: 100 },
    })

    expect(result.pagination).toEqual({
      nextCursor: "abc-123",
      total: 100,
    })
  })

  it("omits pagination when not provided", () => {
    const result = apiResponse({
      data: { items: [] },
      meta: { scope: "organization", mode: "preview" },
    })

    expect(result.pagination).toBeUndefined()
  })

  it("includes date range in meta", () => {
    const result = apiResponse({
      data: {},
      meta: {
        scope: "organization",
        mode: "full",
        from: "2026-01-01",
        to: "2026-06-30",
      },
    })

    expect(result.meta.from).toBe("2026-01-01")
    expect(result.meta.to).toBe("2026-06-30")
  })
})
