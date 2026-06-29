import { beforeEach, describe, expect, it, vi } from "vitest"

const copilotMocks = vi.hoisted(() => ({
  streamCopilotResponse: vi.fn(),
}))

const contextMocks = vi.hoisted(() => ({
  resolveCopilotContext: vi.fn(),
}))

vi.mock("@workspace/copilot", () => ({
  streamCopilotResponse: copilotMocks.streamCopilotResponse,
}))

vi.mock("@workspace/api/services/copilot", () => ({
  resolveCopilotContext: contextMocks.resolveCopilotContext,
  executeCopilotQuery: vi.fn(),
  getLastUserText: vi.fn(),
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
    copilotMocks.streamCopilotResponse.mockReturnValue(
      new Response("stream", { status: 200 })
    )
    contextMocks.resolveCopilotContext.mockResolvedValue({
      organizationId: "org-1",
      userId: "user-1",
      organizationName: "Finca Demo",
      activeParcelId: "parcel-1",
      activeParcelName: "Parcela Norte",
    })
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
    expect(copilotMocks.streamCopilotResponse).not.toHaveBeenCalled()
  })

  it("POST /copilot/chat streams response when authenticated", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/copilot/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [userMessage],
      }),
    })

    expect(res.status).toBe(200)
    expect(contextMocks.resolveCopilotContext).toHaveBeenCalledOnce()
    expect(copilotMocks.streamCopilotResponse).toHaveBeenCalledOnce()
  })

  it("POST /copilot/chat passes parcelId into copilot context", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/copilot/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [userMessage],
        parcelId,
      }),
    })

    expect(res.status).toBe(200)
    expect(contextMocks.resolveCopilotContext).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      parcelId
    )
    expect(copilotMocks.streamCopilotResponse).toHaveBeenCalledWith(
      [userMessage],
      expect.objectContaining({
        ctx: expect.objectContaining({
          activeParcelId: "parcel-1",
          activeParcelName: "Parcela Norte",
        }),
      })
    )
  })
})
