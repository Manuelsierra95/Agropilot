import { client } from "@workspace/web/lib/api/client"
import { notifyDashboardMutation } from "@workspace/web/lib/dashboard/notify-dashboard-mutation"
import type { DashboardScopeParams } from "@workspace/web/lib/dashboard/scope-key"
import { toScopeQuery } from "@workspace/web/lib/dashboard/scope-query"
import type {
  DashboardCalendarEvent,
  TaskCreateInput,
  TaskSelect,
  TaskUpdateInput,
} from "@workspace/schemas"

const createTask = (data: TaskCreateInput): Promise<TaskSelect> =>
  client.api.v1.tasks
    .$post({ json: data })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to create task")
      }
      return res.json() as unknown as Promise<{ data: { task: TaskSelect } }>
    })
    .then((body) => {
      notifyDashboardMutation(["events"], { parcelId: data.parcelId })
      return body.data.task
    })

const getCalendarEvents = (
  scope: DashboardScopeParams
): Promise<DashboardCalendarEvent[]> =>
  client.api.v1.tasks.calendar
    .$get({ query: { ...toScopeQuery(scope), include: "events" } })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch calendar events")
      }
      return res.json() as unknown as Promise<{
        data: { events: DashboardCalendarEvent[] }
      }>
    })
    .then((body) => body.data.events)

const getUpcomingWeek = (
  scope: DashboardScopeParams
): Promise<DashboardCalendarEvent[]> =>
  client.api.v1.tasks.calendar
    .$get({ query: { ...toScopeQuery(scope), include: "upcomingWeek" } })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch upcoming week tasks")
      }
      return res.json() as unknown as Promise<{
        data: { upcomingWeek: DashboardCalendarEvent[] }
      }>
    })
    .then((body) => body.data.upcomingWeek)

const getTask = (taskId: string): Promise<TaskSelect> =>
  client.api.v1.tasks[":taskId"]
    .$get({ param: { taskId } })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch task")
      }
      return res.json() as unknown as Promise<{ data: { task: TaskSelect } }>
    })
    .then((body) => body.data.task)

const updateTask = (
  taskId: string,
  data: TaskUpdateInput
): Promise<TaskSelect> =>
  client.api.v1.tasks[":taskId"]
    .$put({ param: { taskId }, json: data })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to update task")
      }
      return res.json() as unknown as Promise<{ data: { task: TaskSelect } }>
    })
    .then((body) => {
      notifyDashboardMutation(["events"], {
        parcelId: body.data.task.parcelId ?? undefined,
      })
      return body.data.task
    })

const deleteTask = (taskId: string): Promise<void> =>
  client.api.v1.tasks[":taskId"].$delete({ param: { taskId } }).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to delete task")
    }
    notifyDashboardMutation(["events"])
  })

export const tasksApi = {
  createTask,
  getCalendarEvents,
  getUpcomingWeek,
  getTask,
  updateTask,
  deleteTask,
}
