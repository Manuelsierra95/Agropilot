import { describe, expect, it } from "vitest"
import { resolveDateRange } from "@workspace/api/lib/resolve-date-range"

describe("resolveDateRange", () => {
  const campaign = { startDate: "2025-10-01", endDate: "2026-09-30" }

  it("returns campaign range when only campaign provided", () => {
    const result = resolveDateRange({ campaign })
    expect(result).toEqual({
      from: "2025-10-01",
      to: "2026-09-30",
      scope: "organization",
    })
  })

  it("returns explicit dates when only from/to provided (no campaign)", () => {
    const result = resolveDateRange({
      from: "2026-03-01",
      to: "2026-03-31",
    })
    expect(result).toEqual({
      from: "2026-03-01",
      to: "2026-03-31",
      scope: "organization",
    })
  })

  it("clamps sub-range within campaign boundaries", () => {
    const result = resolveDateRange({
      campaign,
      from: "2025-12-01",
      to: "2026-02-28",
    })
    expect(result).toEqual({
      from: "2025-12-01",
      to: "2026-02-28",
      scope: "organization",
    })
  })

  it("clamps dates that extend beyond campaign start", () => {
    const result = resolveDateRange({
      campaign,
      from: "2025-06-01",
      to: "2025-08-31",
    })
    expect(result.from).toBe("2025-10-01")
    expect(result.to).toBe("2025-08-31")
  })

  it("clamps dates that extend beyond campaign end", () => {
    const result = resolveDateRange({
      campaign,
      from: "2026-08-01",
      to: "2026-12-31",
    })
    expect(result.from).toBe("2026-08-01")
    expect(result.to).toBe("2026-09-30")
  })

  it("sets scope to parcel when parcelId is provided", () => {
    const result = resolveDateRange(
      { from: "2026-01-01", to: "2026-06-30" },
      "parcel-123"
    )
    expect(result.scope).toBe("parcel")
  })

  it("sets scope to organization when no parcelId", () => {
    const result = resolveDateRange({
      from: "2026-01-01",
      to: "2026-06-30",
    })
    expect(result.scope).toBe("organization")
  })
})
