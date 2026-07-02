import { beforeEach, describe, expect, it, vi } from "vitest"

const taskMocks = vi.hoisted(() => ({
  createTask: vi.fn(),
  listCalendarTasks: vi.fn(),
  listUpcomingWeekTasks: vi.fn(),
  getTaskById: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}))

vi.mock("@workspace/api/services/tasks", () => taskMocks)

import { app } from "@workspace/api/app"
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
    expect(body.data.task.id).toBe("task-1")
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

  it("GET /tasks/calendar returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/tasks/calendar")
    expect(res.status).toBe(401)
  })

  it("GET /tasks/calendar returns events via include", async () => {
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

    const res = await apiRequest(app, "/api/v1/tasks/calendar?include=events")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.meta.scope).toBe("organization")
    expect(body.data.events).toHaveLength(1)
    expect(taskMocks.listCalendarTasks).toHaveBeenCalledWith(
      TEST_ORG_ID,
      expect.any(Object)
    )
  })

  it("GET /tasks/calendar passes parcelId filter", async () => {
    mockAuthenticatedSession()
    taskMocks.listCalendarTasks.mockResolvedValue([])

    const parcelId = "00000000-0000-4000-8000-000000000001"
    const res = await apiRequest(
      app,
      `/api/v1/tasks/calendar?parcelId=${parcelId}&include=events`
    )
    expect(res.status).toBe(200)
    expect(taskMocks.listCalendarTasks).toHaveBeenCalledWith(TEST_ORG_ID, {
      parcelId,
      mode: "preview",
      include: "events",
    })
  })

  it("GET /tasks/calendar returns 400 for invalid parcelId", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(
      app,
      "/api/v1/tasks/calendar?parcelId=not-a-uuid&include=events"
    )
    expect(res.status).toBe(400)
    expect(taskMocks.listCalendarTasks).not.toHaveBeenCalled()
  })

  it("GET /tasks/:taskId returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/tasks/task-1")
    expect(res.status).toBe(401)
  })

  it("GET /tasks/:taskId returns 200 when task exists", async () => {
    mockAuthenticatedSession()
    taskMocks.getTaskById.mockResolvedValue({
      id: "task-1",
      title: "Podar olivos",
      category: "treatment",
      status: "pending",
    })

    const res = await apiRequest(app, "/api/v1/tasks/task-1")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.task.id).toBe("task-1")
    expect(taskMocks.getTaskById).toHaveBeenCalledWith(TEST_ORG_ID, "task-1")
  })

  it("GET /tasks/:taskId returns 404 when task not found", async () => {
    mockAuthenticatedSession()
    taskMocks.getTaskById.mockResolvedValue(null)

    const res = await apiRequest(app, "/api/v1/tasks/task-missing")
    expect(res.status).toBe(404)
  })

  it("PUT /tasks/:taskId returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/tasks/task-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    })
    expect(res.status).toBe(401)
  })

  it("PUT /tasks/:taskId updates a task when authenticated", async () => {
    mockAuthenticatedSession()
    taskMocks.updateTask.mockResolvedValue({
      id: "task-1",
      title: "Podar olivos actualizado",
      category: "treatment",
      status: "pending",
    })

    const res = await apiRequest(app, "/api/v1/tasks/task-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Podar olivos actualizado" }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.task.title).toBe("Podar olivos actualizado")
    expect(taskMocks.updateTask).toHaveBeenCalledWith(
      TEST_ORG_ID,
      "task-1",
      expect.objectContaining({
        title: "Podar olivos actualizado",
      })
    )
  })

  it("PUT /tasks/:taskId accepts ISO datetime startDate for calendar reschedule", async () => {
    mockAuthenticatedSession()
    taskMocks.updateTask.mockResolvedValue({
      id: "task-1",
      title: "Riego",
      category: "irrigation",
      status: "pending",
    })

    const res = await apiRequest(app, "/api/v1/tasks/task-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: "2026-07-02T14:00:00.000Z",
        endDate: "2026-07-02T16:00:00.000Z",
      }),
    })

    expect(res.status).toBe(200)
    expect(taskMocks.updateTask).toHaveBeenCalledWith(
      TEST_ORG_ID,
      "task-1",
      expect.objectContaining({
        startDate: "2026-07-02T14:00:00.000Z",
        endDate: "2026-07-02T16:00:00.000Z",
      })
    )
  })

  it("PUT /tasks/:taskId returns 400 for invalid payload", async () => {
    mockAuthenticatedSession()

    const res = await apiRequest(app, "/api/v1/tasks/task-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "" }),
    })

    expect(res.status).toBe(400)
    expect(taskMocks.updateTask).not.toHaveBeenCalled()
  })

  it("PUT /tasks/:taskId returns 404 when task not found", async () => {
    mockAuthenticatedSession()
    taskMocks.updateTask.mockResolvedValue(null)

    const res = await apiRequest(app, "/api/v1/tasks/task-missing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    })

    expect(res.status).toBe(404)
  })

  it("DELETE /tasks/:taskId returns 401 without auth", async () => {
    const res = await apiRequest(app, "/api/v1/tasks/task-1", {
      method: "DELETE",
    })
    expect(res.status).toBe(401)
  })

  it("DELETE /tasks/:taskId deletes a task when authenticated", async () => {
    mockAuthenticatedSession()
    taskMocks.deleteTask.mockResolvedValue(true)

    const res = await apiRequest(app, "/api/v1/tasks/task-1", {
      method: "DELETE",
    })

    expect(res.status).toBe(204)
    expect(taskMocks.deleteTask).toHaveBeenCalledWith(TEST_ORG_ID, "task-1")
  })

  it("DELETE /tasks/:taskId returns 404 when task not found", async () => {
    mockAuthenticatedSession()
    taskMocks.deleteTask.mockResolvedValue(false)

    const res = await apiRequest(app, "/api/v1/tasks/task-missing", {
      method: "DELETE",
    })

    expect(res.status).toBe(404)
  })
})
