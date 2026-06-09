import { beforeEach, describe, expect, it, vi } from "vitest"

const copilotMocks = vi.hoisted(() => ({
  streamCopilotResponse: vi.fn(),
}))

vi.mock("@workspace/copilot", () => ({
  streamCopilotResponse: copilotMocks.streamCopilotResponse,
}))

import { app } from "api/app"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { apiRequest } from "../helpers/request"

describe("copilot routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticated()
    copilotMocks.streamCopilotResponse.mockReturnValue(
      new Response("stream", { status: 200 })
    )
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
    expect(body).toEqual({
      suggestions: [
        "¿Qué temperatura hace hoy?",
        "Precios Virgen y Virgen Extra en enero",
        "Créame una tarea para el lunes de fumigar Olivos",
      ],
    })
  })

  it("POST /copilot/chat returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/copilot/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [] }),
    })
    expect(res.status).toBe(401)
  })

  it("POST /copilot/chat streams response when authenticated", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/copilot/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "Hola" }] }],
      }),
    })

    expect(res.status).toBe(200)
    expect(copilotMocks.streamCopilotResponse).toHaveBeenCalledOnce()
  })
})
