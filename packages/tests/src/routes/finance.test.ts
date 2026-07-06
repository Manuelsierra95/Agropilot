import { beforeEach, describe, expect, it, vi } from "vitest"

const financeMocks = vi.hoisted(() => ({
  listTransactions: vi.fn(),
  getTransactionById: vi.fn(),
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  bulkCreateTransactions: vi.fn(),
  getOlivePricesForDashboard: vi.fn(),
  getSellingWindowForDashboard: vi.fn(),
  getFinanceResumeForDashboard: vi.fn(),
  getCampaignMarginForDashboard: vi.fn(),
  getRecentTransactionsForDashboard: vi.fn(),
  getTransactionsForDashboard: vi.fn(),
  getProductionValueForDashboard: vi.fn(),
  getParcelsFinanceComparisonForDashboard: vi.fn(),
  getParcelsSellingWindowsForDashboard: vi.fn(),
  updateCampaignSaleTarget: vi.fn(),
}))

vi.mock("@workspace/api/services/finance", () => financeMocks)

import { app } from "@workspace/api/app"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { TEST_ORG_ID } from "../helpers/fixtures"
import { apiRequest } from "../helpers/request"

describe("finance routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticated()
  })

  it("GET /finance returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/finance")
    expect(res.status).toBe(401)
  })

  it("GET /finance returns transactions via include", async () => {
    mockAuthenticatedSession()
    financeMocks.getTransactionsForDashboard.mockResolvedValue([{ id: "tx-1" }])

    const res = await apiRequest(app, "/api/v1/finance?include=transactions")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.meta.scope).toBe("organization")
    expect(body.data.transactions).toHaveLength(1)
  })

  it("GET /finance returns resume via include", async () => {
    mockAuthenticatedSession()
    financeMocks.getFinanceResumeForDashboard.mockResolvedValue({
      transactions: [],
    })

    const res = await apiRequest(app, "/api/v1/finance?include=resume")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.resume.transactions).toEqual([])
  })

  it("GET /finance returns sellingWindow via include", async () => {
    mockAuthenticatedSession()
    financeMocks.getSellingWindowForDashboard.mockResolvedValue({
      lonjaPrice: 5.42,
      costPerKg: 3.8,
      estimatedKg: 1000,
    })

    const res = await apiRequest(app, "/api/v1/finance?include=sellingWindow")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.sellingWindow.lonjaPrice).toBe(5.42)
  })

  it("GET /finance returns recentTransactions via include", async () => {
    mockAuthenticatedSession()
    financeMocks.getRecentTransactionsForDashboard.mockResolvedValue([])

    const res = await apiRequest(app, "/api/v1/finance?include=recentTransactions")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.recentTransactions).toEqual([])
  })

  it("POST /finance creates a transaction", async () => {
    mockAuthenticatedSession()
    financeMocks.createTransaction.mockResolvedValue({ id: "tx-new" })

    const res = await apiRequest(app, "/api/v1/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concept: "Venta aceite",
        flow: "income",
        date: "2026-01-15",
        category: "sale",
        amount: 1200,
      }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.transaction.id).toBe("tx-new")
  })

  it("POST /finance returns 400 for invalid payload", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept: "" }),
    })

    expect(res.status).toBe(400)
  })

  it("PATCH /finance/selling-window/campaign-target returns 401 without auth", async () => {
    const res = await apiRequest(
      app,
      "/api/v1/finance/selling-window/campaign-target",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelId: "00000000-0000-4000-8000-000000000001",
          campaignTarget: 5.5,
        }),
      }
    )

    expect(res.status).toBe(401)
  })

  it("PATCH /finance/selling-window/campaign-target updates campaign target", async () => {
    mockAuthenticatedSession()
    financeMocks.updateCampaignSaleTarget.mockResolvedValue({
      campaignTarget: 5.5,
    })

    const res = await apiRequest(
      app,
      "/api/v1/finance/selling-window/campaign-target",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelId: "00000000-0000-4000-8000-000000000001",
          campaignTarget: 5.5,
        }),
      }
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.campaignTarget).toBe(5.5)
    expect(financeMocks.updateCampaignSaleTarget).toHaveBeenCalledWith(
      TEST_ORG_ID,
      {
        parcelId: "00000000-0000-4000-8000-000000000001",
        campaignTarget: 5.5,
      }
    )
  })

  it("PATCH /finance/selling-window/campaign-target returns 400 for invalid payload", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(
      app,
      "/api/v1/finance/selling-window/campaign-target",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelId: "not-a-uuid",
          campaignTarget: -1,
        }),
      }
    )

    expect(res.status).toBe(400)
  })

  it("PUT /finance/:id updates a transaction", async () => {
    mockAuthenticatedSession()
    financeMocks.updateTransaction.mockResolvedValue({ id: "tx-1" })

    const res = await apiRequest(app, "/api/v1/finance/tx-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept: "Updated" }),
    })

    expect(res.status).toBe(200)
  })

  it("DELETE /finance/:id deletes a transaction", async () => {
    mockAuthenticatedSession()
    financeMocks.deleteTransaction.mockResolvedValue(undefined)

    const res = await apiRequest(app, "/api/v1/finance/tx-1", {
      method: "DELETE",
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe("tx-1")
  })

  it("POST /finance/bulk creates multiple transactions", async () => {
    mockAuthenticatedSession()
    financeMocks.bulkCreateTransactions.mockResolvedValue([
      { id: "tx-1" },
      { id: "tx-2" },
    ])

    const res = await apiRequest(app, "/api/v1/finance/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactions: [
          {
            concept: "Gasto",
            flow: "expense",
            date: "2026-01-10",
            category: "fuel",
            amount: 90,
          },
        ],
      }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.count).toBe(2)
  })

  it("GET /finance/olive-prices returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/finance/olive-prices")
    expect(res.status).toBe(401)
  })

  it("GET /finance/olive-prices returns olive prices", async () => {
    mockAuthenticatedSession()
    financeMocks.getOlivePricesForDashboard.mockResolvedValue([
      { name: "Virgen Extra", price: 5.42 },
    ])

    const res = await apiRequest(app, "/api/v1/finance/olive-prices")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.olivePrices).toHaveLength(1)
  })

  it("GET /finance/parcelId filters returns 400 for invalid parcelId", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(
      app,
      "/api/v1/finance?parcelId=not-a-uuid&include=transactions"
    )
    expect(res.status).toBe(400)
  })
})
