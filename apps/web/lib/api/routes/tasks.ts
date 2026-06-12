import { client } from "@/lib/api/client"
import { notifyDashboardMutation } from "@/lib/dashboard/notify-dashboard-mutation"
import type { DashboardScopeParams } from "@/lib/dashboard/scope-key"
import { toScopeQuery } from "@/lib/dashboard/scope-query"
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
      return res.json()
    })
    .then((body) => {
      notifyDashboardMutation(["events"], { parcelId: data.parcelId })
      return body.task
    })

const getUpcomingWeek = (
  scope: DashboardScopeParams
): Promise<DashboardCalendarEvent[]> =>
  client.api.v1.tasks["upcoming-week"]
    .$get({ query: toScopeQuery(scope) })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch upcoming week tasks")
      }
      return res.json()
    })
    .then((body) => body.events)

export const tasksApi = {
  createTask,
  getUpcomingWeek,
}
