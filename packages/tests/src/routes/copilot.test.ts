import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@workspace/api/services/copilot", () => ({
  getCopilotSuggestions: vi.fn().mockResolvedValue([
    "Muéstrame ingresos y gastos del último trimestre",
    "¿Cómo está el clima en mis parcelas?",
    "Crea una tarea de riego para mañana",
  ]),
}))

import { app } from "@workspace/api/app"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { apiRequest } from "../helpers/request"

const userMessage = {
  id: "1",
  role: "user" as const,
  parts: [{ type: "text", text: "Hola" }],
}

const parcelId = "00000000-0000-4000-8000-000000000001"

describe("copilot routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticated()
  })

  it("GET /copilot/suggestions returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/copilot/suggestions")
    expect(res.status).toBe(401)
  })

  it("GET /copilot/suggestions returns suggestions when authenticated", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/copilot/suggestions")
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.meta.scope).toBe("organization")
    expect(body.data.suggestions).toEqual([
      "Muéstrame ingresos y gastos del último trimestre",
      "¿Cómo está el clima en mis parcelas?",
      "Crea una tarea de riego para mañana",
    ])
  })

  it("POST /copilot/chat returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/copilot/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [userMessage] }),
    })
    expect(res.status).toBe(401)
  })

  it("POST /copilot/chat returns 400 for invalid parcelId", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/copilot/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [userMessage],
        parcelId: "not-a-uuid",
      }),
    })

    expect(res.status).toBe(400)
  })

  it("POST /copilot/chat returns under construction message when authenticated", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/copilot/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [userMessage],
      }),
    })

    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain("en construcción")
  })

  it("POST /copilot/chat accepts parcelId while copilot is under construction", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/copilot/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [userMessage],
        parcelId,
      }),
    })

    const body = await res.text()

    expect(res.status).toBe(200)
    expect(body).toContain("en construcción")
  })
})
