import { beforeEach, describe, expect, it, vi } from "vitest"

import type { QuerySpec } from "@workspace/copilot"

const serviceMocks = vi.hoisted(() => ({
  queryTransactions: vi.fn(),
  queryMarketPrices: vi.fn(),
  queryParcelCashflow: vi.fn(),
  queryParcelWeather: vi.fn(),
  queryTasks: vi.fn(),
}))

vi.mock("@workspace/api/services/finance", () => ({
  queryTransactions: serviceMocks.queryTransactions,
  queryMarketPrices: serviceMocks.queryMarketPrices,
}))

vi.mock("@workspace/api/services/parcels", () => ({
  queryParcelCashflow: serviceMocks.queryParcelCashflow,
  queryParcelWeather: serviceMocks.queryParcelWeather,
}))

vi.mock("@workspace/api/services/tasks", () => ({
  queryTasks: serviceMocks.queryTasks,
}))

import { executeCopilotQuery } from "@workspace/api/services/copilot"

const ctx = {
  organizationId: "org-test",
  userId: "user-test",
}

function buildQuery(source: QuerySpec["source"]): QuerySpec {
  switch (source) {
    case "marketPrices":
      return {
        source,
        grade: "virgen_extra",
        from: "2026-01-01",
        to: "2026-01-31",
      }
    case "transactions":
      return { source, from: "2026-01-01", to: "2026-01-31" }
    case "parcelCashflow":
      return { source, from: "2026-01-01", to: "2026-01-31" }
    case "parcelWeather":
      return {
        source,
        metric: "temperature",
        from: "2026-01-01",
        to: "2026-01-31",
      }
    case "tasks":
      return { source, from: "2026-01-01", to: "2026-01-31" }
  }
}

describe("executeCopilotQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("maps marketPrices rows", async () => {
    serviceMocks.queryMarketPrices.mockResolvedValue([
      { date: "2026-01-15", price: "5.4200" },
    ])

    const query = buildQuery("marketPrices")
    const result = await executeCopilotQuery(query, 0, ctx)

    expect(serviceMocks.queryMarketPrices).toHaveBeenCalledWith({
      grade: "virgen_extra",
      from: "2026-01-01",
      to: "2026-01-31",
    })
    expect(result.error).toBeUndefined()
    expect(result.label).toBe("Aceite Virgen Extra")
    expect(result.rows).toEqual([
      {
        date: "2026-01-15",
        value: 5.42,
        label: "Aceite Virgen Extra",
        dataKey: "virgen_extra_q0",
      },
    ])
  })

  it("maps parcelCashflow rows with income and expense series", async () => {
    serviceMocks.queryParcelCashflow.mockResolvedValue([
      {
        date: "2026-01-10",
        income: "1200.00",
        expense: "0",
        parcelId: "parcel-1",
      },
      {
        date: "2026-01-11",
        income: "0",
        expense: "90.00",
        parcelId: "parcel-1",
      },
    ])

    const query = buildQuery("parcelCashflow")
    const result = await executeCopilotQuery(query, 1, ctx)

    expect(serviceMocks.queryParcelCashflow).toHaveBeenCalledWith(
      "org-test",
      { from: "2026-01-01", to: "2026-01-31", parcelId: undefined }
    )
    expect(result.rows).toEqual([
      {
        date: "2026-01-10",
        value: 1200,
        label: "Ingresos diarios",
        dataKey: "cashflow_all_q1_income",
      },
      {
        date: "2026-01-11",
        value: 90,
        label: "Gastos diarios",
        dataKey: "cashflow_all_q1_expense",
      },
    ])
  })

  it("maps parcelWeather rows with parcel label", async () => {
    serviceMocks.queryParcelWeather.mockResolvedValue([
      {
        date: "2026-01-05",
        value: 14,
        parcelId: "parcel-1",
        parcelName: "La Mata",
      },
    ])

    const query = buildQuery("parcelWeather")
    const result = await executeCopilotQuery(query, 2, ctx)

    expect(serviceMocks.queryParcelWeather).toHaveBeenCalledWith(
      "org-test",
      {
        from: "2026-01-01",
        to: "2026-01-31",
        parcelId: undefined,
        metric: "temperature",
      }
    )
    expect(result.label).toBe("Temperatura — La Mata")
    expect(result.rows[0]).toMatchObject({
      date: "2026-01-05",
      value: 14,
      label: "Temperatura",
      dataKey: "temperature_default_q2",
    })
  })

  it("maps tasks rows", async () => {
    serviceMocks.queryTasks.mockResolvedValue([
      {
        startDate: new Date("2026-01-12T08:00:00.000Z"),
        category: "irrigation",
        status: "pending",
      },
    ])

    const query: QuerySpec = {
      source: "tasks",
      from: "2026-01-01",
      to: "2026-01-31",
      status: "pending",
      category: "irrigation",
    }
    const result = await executeCopilotQuery(query, 3, ctx)

    expect(serviceMocks.queryTasks).toHaveBeenCalledWith("org-test", {
      from: "2026-01-01",
      to: "2026-01-31",
      status: "pending",
      category: "irrigation",
    })
    expect(result.rows).toEqual([
      {
        date: "2026-01-12",
        value: 1,
        label: "Tareas irrigation",
        dataKey: "tasks_irrigation_pending_q3",
      },
    ])
  })

  it("returns empty rows without error when service has no data", async () => {
    serviceMocks.queryMarketPrices.mockResolvedValue([])

    const result = await executeCopilotQuery(buildQuery("marketPrices"), 0, ctx)

    expect(result.error).toBeUndefined()
    expect(result.rows).toEqual([])
  })
})
