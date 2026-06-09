import { beforeEach, describe, expect, it, vi } from "vitest"

const financeMocks = vi.hoisted(() => ({
  listTransactions: vi.fn(),
  getTransactionById: vi.fn(),
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  bulkCreateTransactions: vi.fn(),
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

    const res = await apiRequest(app, "/api/v1/finance/tx-1", { method: "DELETE" })
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
})
