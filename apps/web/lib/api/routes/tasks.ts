import { client } from "@workspace/web/lib/api/client"
import { notifyDashboardMutation } from "@workspace/web/lib/dashboard/notify-dashboard-mutation"
import type { DashboardScopeParams } from "@workspace/web/lib/dashboard/scope-key"
import { toScopeQuery } from "@workspace/web/lib/dashboard/scope-query"
import type {
  DashboardCalendarEvent,
  TaskCreateInput,
  TaskSelect,
} from "@workspace/schemas"

const createTask = (data: TaskCreateInput): Promise<TaskSelect> =>
  client.api.v1.tasks
    .$post({ json: data })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to create task")
      }
      return res.json() as Promise<{ data: { task: TaskSelect } }>
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
      return res.json() as Promise<{ data: { events: DashboardCalendarEvent[] } }>
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
      return res.json() as Promise<{ data: { upcomingWeek: DashboardCalendarEvent[] } }>
    })
    .then((body) => body.data.upcomingWeek)

export const tasksApi = {
  createTask,
  getCalendarEvents,
  getUpcomingWeek,
}
