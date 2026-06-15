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
}))

vi.mock("@/services/finance", () => financeMocks)

import { app } from "api/app"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
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

  it("GET /finance returns transactions", async () => {
    mockAuthenticatedSession()
    financeMocks.listTransactions.mockResolvedValue([{ id: "tx-1" }])

    const res = await apiRequest(app, "/api/v1/finance")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.transactions).toHaveLength(1)
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
    expect(body.transaction.id).toBe("tx-new")
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
    expect(body.count).toBe(2)
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
    expect(body.olivePrices).toHaveLength(1)
  })

  it("GET /finance/selling-window returns selling window", async () => {
    mockAuthenticatedSession()
    financeMocks.getSellingWindowForDashboard.mockResolvedValue({
      lonjaPrice: 5.42,
      costPerKg: 3.8,
      estimatedKg: 1000,
    })

    const res = await apiRequest(app, "/api/v1/finance/selling-window")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.sellingWindow.lonjaPrice).toBe(5.42)
  })

  it("GET /finance/selling-window returns 400 for invalid parcelId", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(
      app,
      "/api/v1/finance/selling-window?parcelId=not-a-uuid"
    )
    expect(res.status).toBe(400)
  })

  it("GET /finance/resume returns finance resume", async () => {
    mockAuthenticatedSession()
    financeMocks.getFinanceResumeForDashboard.mockResolvedValue({
      transactions: [],
    })

    const res = await apiRequest(app, "/api/v1/finance/resume")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.finance.transactions).toEqual([])
  })

  it("GET /finance/campaign-margin returns margin series", async () => {
    mockAuthenticatedSession()
    financeMocks.getCampaignMarginForDashboard.mockResolvedValue({
      campaignStart: "2025-10-01",
      points: [],
    })

    const res = await apiRequest(app, "/api/v1/finance/campaign-margin")
    expect(res.status).toBe(200)
  })

  it("GET /finance/recent-transactions returns transactions", async () => {
    mockAuthenticatedSession()
    financeMocks.getRecentTransactionsForDashboard.mockResolvedValue([])

    const res = await apiRequest(app, "/api/v1/finance/recent-transactions")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.transactions).toEqual([])
  })

  it("GET /finance/transactions returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/finance/transactions")
    expect(res.status).toBe(401)
  })

  it("GET /finance/transactions returns scoped transactions", async () => {
    mockAuthenticatedSession()
    financeMocks.getTransactionsForDashboard.mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000099",
        userId: "user-1",
        concept: "Venta aceite",
        description: null,
        type: "ingreso",
        category: "Venta de cosecha",
        amount: 1200,
        paymentMethod: "transferencia",
        invoiceNumber: null,
        date: "2026-01-15",
        parcelId: "00000000-0000-4000-8000-000000000001",
        createdAt: "2026-01-15T10:00:00.000Z",
        updatedAt: "2026-01-15T10:00:00.000Z",
      },
    ])

    const res = await apiRequest(app, "/api/v1/finance/transactions")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.transactions).toHaveLength(1)
    expect(body.transactions[0].concept).toBe("Venta aceite")
  })

  it("GET /finance/transactions returns 400 for invalid parcelId", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(
      app,
      "/api/v1/finance/transactions?parcelId=not-a-uuid"
    )
    expect(res.status).toBe(400)
  })

  it("GET /finance/production-value returns production value", async () => {
    mockAuthenticatedSession()
    financeMocks.getProductionValueForDashboard.mockResolvedValue({
      monthlyProductionKg: Array(12).fill(0),
      prevMonthlyProductionKg: Array(12).fill(0),
      lonjaPrice: 5.42,
      numOlivos: 100,
      campaignStartYear: 2025,
    })

    const res = await apiRequest(app, "/api/v1/finance/production-value")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.productionValue.numOlivos).toBe(100)
  })

  it("GET /finance/parcels-comparison returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/finance/parcels-comparison")
    expect(res.status).toBe(401)
  })

  it("GET /finance/parcels-comparison returns parcel comparison", async () => {
    mockAuthenticatedSession()
    financeMocks.getParcelsFinanceComparisonForDashboard.mockResolvedValue({
      parcels: [
        {
          parcelId: "00000000-0000-4000-8000-000000000001",
          name: "La Mata",
          income: 12000,
          expense: 8000,
          profit: 4000,
          totalKg: 5000,
        },
      ],
    })

    const res = await apiRequest(app, "/api/v1/finance/parcels-comparison")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.parcelsComparison.parcels).toHaveLength(1)
    expect(body.parcelsComparison.parcels[0].name).toBe("La Mata")
  })

  it("GET /finance/selling-windows returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/finance/selling-windows")
    expect(res.status).toBe(401)
  })

  it("GET /finance/selling-windows returns bulk selling windows", async () => {
    mockAuthenticatedSession()
    financeMocks.getParcelsSellingWindowsForDashboard.mockResolvedValue({
      parcels: [
        {
          parcelId: "00000000-0000-4000-8000-000000000001",
          name: "La Mata",
          lonjaPrice: 5.42,
          costPerKg: 3.8,
          estimatedKg: 1000,
        },
      ],
    })

    const res = await apiRequest(app, "/api/v1/finance/selling-windows")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.sellingWindows.parcels).toHaveLength(1)
    expect(body.sellingWindows.parcels[0].lonjaPrice).toBe(5.42)
  })
})
