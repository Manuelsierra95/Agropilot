import { beforeEach, describe, expect, it, vi } from "vitest"

const taskMocks = vi.hoisted(() => ({
  createTask: vi.fn(),
  listCalendarTasks: vi.fn(),
  listUpcomingWeekTasks: vi.fn(),
}))

vi.mock("@/services/tasks", () => taskMocks)

import { app } from "api/app"
import { TEST_ORG_ID } from "../helpers/fixtures"
import {
  mockAuthenticatedSession,
  mockUnauthenticated,
} from "../helpers/mock-session"
import { apiRequest } from "../helpers/request"

describe("tasks routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticated()
  })

  it("POST /tasks returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Podar olivos",
        category: "treatment",
        startDate: "2026-06-12",
      }),
    })
    expect(res.status).toBe(401)
  })

  it("POST /tasks creates a task when authenticated", async () => {
    mockAuthenticatedSession()
    taskMocks.createTask.mockResolvedValue({
      id: "task-1",
      title: "Podar olivos",
      category: "treatment",
      status: "pending",
    })

    const res = await apiRequest(app, "/api/v1/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Podar olivos",
        category: "treatment",
        startDate: "2026-06-12",
        description: "Poda de formación",
      }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.task.id).toBe("task-1")
    expect(taskMocks.createTask).toHaveBeenCalledWith(
      TEST_ORG_ID,
      expect.objectContaining({
        title: "Podar olivos",
        category: "treatment",
        startDate: "2026-06-12",
      })
    )
  })

  it("POST /tasks returns 400 for invalid payload", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "",
        category: "invalid",
        startDate: "not-a-date",
      }),
    })

    expect(res.status).toBe(400)
    expect(taskMocks.createTask).not.toHaveBeenCalled()
  })

  it("GET /tasks/calendar-events returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/tasks/calendar-events")
    expect(res.status).toBe(401)
  })

  it("GET /tasks/calendar-events returns events", async () => {
    mockAuthenticatedSession()
    taskMocks.listCalendarTasks.mockResolvedValue([
      {
        id: "task-1",
        title: "Riego",
        type: "irrigation",
        parcelId: "p-1",
        parcelName: "La Mata",
        color: "blue",
        status: "pending",
        start: "2026-06-09T08:00:00.000Z",
        end: "2026-06-09T09:00:00.000Z",
      },
    ])

    const res = await apiRequest(app, "/api/v1/tasks/calendar-events")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.events).toHaveLength(1)
    expect(taskMocks.listCalendarTasks).toHaveBeenCalledWith(
      TEST_ORG_ID,
      expect.any(Object)
    )
  })

  it("GET /tasks/calendar-events passes parcelId filter", async () => {
    mockAuthenticatedSession()
    taskMocks.listCalendarTasks.mockResolvedValue([])

    const parcelId = "00000000-0000-4000-8000-000000000001"
    const res = await apiRequest(
      app,
      `/api/v1/tasks/calendar-events?parcelId=${parcelId}`
    )
    expect(res.status).toBe(200)
    expect(taskMocks.listCalendarTasks).toHaveBeenCalledWith(TEST_ORG_ID, {
      parcelId,
    })
  })

  it("GET /tasks/calendar-events returns 400 for invalid parcelId", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(
      app,
      "/api/v1/tasks/calendar-events?parcelId=not-a-uuid"
    )
    expect(res.status).toBe(400)
    expect(taskMocks.listCalendarTasks).not.toHaveBeenCalled()
  })

  it("GET /tasks/upcoming-week returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/tasks/upcoming-week")
    expect(res.status).toBe(401)
  })

  it("GET /tasks/upcoming-week returns events", async () => {
    mockAuthenticatedSession()
    taskMocks.listUpcomingWeekTasks.mockResolvedValue([
      {
        id: "task-1",
        title: "Riego",
        type: "irrigation",
        parcelId: "p-1",
        parcelName: "La Mata",
        color: "blue",
        status: "pending",
        start: "2026-06-09T08:00:00.000Z",
        end: "2026-06-09T09:00:00.000Z",
      },
    ])

    const res = await apiRequest(app, "/api/v1/tasks/upcoming-week")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.events).toHaveLength(1)
  })

  it("GET /tasks/upcoming-week returns 400 for invalid weekStart", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(
      app,
      "/api/v1/tasks/upcoming-week?weekStart=invalid"
    )
    expect(res.status).toBe(400)
  })
})
