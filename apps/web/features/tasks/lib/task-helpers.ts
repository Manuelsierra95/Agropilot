import type { TaskSelect, TaskStatus } from "@workspace/schemas"
import type {
  CalendarTask,
  CalendarTaskStatus,
} from "@workspace/web/lib/calendar/types"

const TASK_CATEGORY_COLORS: Record<string, string> = {
  irrigation: "blue",
  fertilization: "green",
  treatment: "red",
  harvest: "yellow",
  inspection: "purple",
}

const TASK_STATUS_TO_CALENDAR: Record<TaskStatus, CalendarTaskStatus> = {
  pending: "pending",
  in_progress: "in_progress",
  done: "completed",
  skipped: "completed",
}

export function getTaskColor(category: string): string {
  return TASK_CATEGORY_COLORS[category] ?? "gray"
}

export function taskSelectToCalendarTask(
  task: TaskSelect,
  parcelName: string
): CalendarTask {
  const start = new Date(task.startDate)
  const end = task.endDate ? new Date(task.endDate) : start

  return {
    id: task.id,
    title: task.title,
    category: task.category,
    parcelId: task.parcelId ?? "",
    parcelName,
    color: getTaskColor(task.category),
    status: TASK_STATUS_TO_CALENDAR[task.status],
    start,
    end,
    meta: task.priority
      ? {
          priority:
            task.priority >= 3 ? "high" : task.priority >= 2 ? "medium" : "low",
        }
      : undefined,
  }
}
