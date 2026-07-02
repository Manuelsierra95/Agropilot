import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import { isSameDay } from "date-fns"

export default function CalendarBodyDayTasks() {
  const { tasks, date, setTaskDetailSheetOpen, setSelectedTaskId } =
    useCalendarContext()
  const dayTasks = tasks.filter((task) => isSameDay(task.start, date))

  return !!dayTasks.length ? (
    <div className="flex flex-col gap-2">
      <p className="font-heading p-2 pb-0 font-medium">Tareas</p>
      <div className="flex flex-col gap-2">
        {dayTasks.map((task) => (
          <div
            key={task.id}
            className="flex cursor-pointer items-center gap-2 px-2"
            onClick={() => {
              setSelectedTaskId(task.id)
              setTaskDetailSheetOpen(true)
            }}
          >
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full bg-${task.color}-500`} />
              <p className="text-sm font-medium text-muted-foreground">
                {task.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="p-2 text-muted-foreground">No hay tareas hoy...</div>
  )
}
