import { CalendarTask as CalendarTaskType } from "@workspace/web/features/calendar/components/calendar/calendar-types"
import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import { format, isSameDay } from "date-fns"
import { cn } from "@workspace/ui/lib/utils"

interface TaskPosition {
  left: string
  width: string
  top: string
  height: string
}

function getOverlappingTasks(
  currentTask: CalendarTaskType,
  tasks: CalendarTaskType[]
): CalendarTaskType[] {
  return tasks.filter((task) => {
    if (task.id === currentTask.id) return false
    return (
      currentTask.start < task.end &&
      currentTask.end > task.start &&
      isSameDay(currentTask.start, task.start)
    )
  })
}

export function calculateTaskPosition(
  task: CalendarTaskType,
  allTasks: CalendarTaskType[]
): TaskPosition {
  const overlappingTasks = getOverlappingTasks(task, allTasks)
  const group = [task, ...overlappingTasks].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  )
  const position = group.indexOf(task)
  const width = `${100 / (overlappingTasks.length + 1)}%`
  const left = `${(position * 100) / (overlappingTasks.length + 1)}%`

  const startHour = task.start.getHours()
  const startMinutes = task.start.getMinutes()

  let endHour = task.end.getHours()
  let endMinutes = task.end.getMinutes()

  if (!isSameDay(task.start, task.end)) {
    endHour = 23
    endMinutes = 59
  }

  const topPosition = startHour * 128 + (startMinutes / 60) * 128
  const duration = endHour * 60 + endMinutes - (startHour * 60 + startMinutes)
  const height = (duration / 60) * 128

  return {
    left,
    width,
    top: `${topPosition}px`,
    height: `${height}px`,
  }
}

export default function CalendarTask({
  task,
  month = false,
  className,
  embedded = false,
}: {
  task: CalendarTaskType
  month?: boolean
  className?: string
  disableLayoutAnimation?: boolean
  embedded?: boolean
}) {
  const { tasks, setSelectedTaskId, setTaskDetailSheetOpen } =
    useCalendarContext()
  const style = month || embedded ? {} : calculateTaskPosition(task, tasks)

  return (
    <div
      className={cn(
        `cursor-pointer truncate rounded-md px-3 py-1.5 transition-colors bg-${task.color}-500/10 hover:bg-${task.color}-500/20 border border-${task.color}-500`,
        !month && !embedded && "absolute",
        embedded && "h-full",
        className
      )}
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedTaskId(task.id)
        setTaskDetailSheetOpen(true)
      }}
    >
      <div
        className={cn(
          `flex w-full flex-col text-${task.color}-500`,
          month && "flex-row items-center justify-between"
        )}
      >
        <p className={cn("truncate font-bold", month && "text-xs")}>
          {task.title}
        </p>
        <p className={cn("text-sm", month && "text-xs")}>
          <span>{format(task.start, "h:mm a")}</span>
          <span className={cn("mx-1", month && "hidden")}>-</span>
          <span className={cn(month && "hidden")}>
            {format(task.end, "h:mm a")}
          </span>
        </p>
      </div>
    </div>
  )
}
