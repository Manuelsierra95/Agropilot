import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import { isSameMonth } from "date-fns"

export default function CalendarHeaderDateBadge() {
  const { tasks, date } = useCalendarContext()
  const monthTasks = tasks.filter((task) => isSameMonth(task.start, date))

  if (!monthTasks.length) return null
  return (
    <div className="rounded-sm border px-1.5 py-0.5 text-xs whitespace-nowrap">
      {monthTasks.length} {monthTasks.length === 1 ? "tarea" : "tareas"}
    </div>
  )
}
