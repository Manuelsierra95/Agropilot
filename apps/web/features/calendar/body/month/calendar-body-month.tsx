import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  isWithinInterval,
} from "date-fns"
import { cn } from "@workspace/ui/lib/utils"
import { CalendarDropZone } from "@workspace/web/features/calendar/components/calendar/calendar-drop-zone"
import { useCalendarDnd } from "@workspace/web/features/calendar/components/calendar/calendar-dnd-provider"
import { DraggableCalendarTask } from "@workspace/web/features/calendar/components/calendar/draggable-calendar-task"

type CalendarBodyMonthProps = {
  maxVisibleEvents?: number
}

export default function CalendarBodyMonth({
  maxVisibleEvents = 5,
}: CalendarBodyMonthProps) {
  const { date, tasks, setDate, setMode } = useCalendarContext()
  const { didDragRecently } = useCalendarDnd()

  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const today = new Date()

  const visibleTasks = tasks.filter(
    (task) =>
      isWithinInterval(task.start, {
        start: calendarStart,
        end: calendarEnd,
      }) ||
      isWithinInterval(task.end, { start: calendarStart, end: calendarEnd })
  )

  return (
    <div className="flex flex-grow flex-col">
      <div className="grid grid-cols-7 divide-x divide-border border-border/30">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="border-b border-border/30 py-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div
        key={monthStart.toISOString()}
        className="relative grid grid-cols-7"
      >
        {calendarDays.map((day) => {
          const dayTasks = visibleTasks.filter((task) =>
            isSameDay(task.start, day)
          )
          const isToday = isSameDay(day, today)
          const isCurrentMonth = isSameMonth(day, date)

          const taskCount = dayTasks.length
          let minHeightClass = "min-h-20"
          if (taskCount > 0) minHeightClass = "min-h-28"
          if (taskCount > 2) minHeightClass = "min-h-36"
          if (taskCount > 4) minHeightClass = "min-h-44"

          const isLastColumn = calendarDays.indexOf(day) % 7 === 6
          const totalDays = calendarDays.length
          const isLastRow = calendarDays.indexOf(day) >= totalDays - 7

          return (
            <CalendarDropZone
              key={day.toISOString()}
              type="day"
              date={day}
              className={cn(
                "relative flex cursor-pointer flex-col border-r border-b border-border/30 p-2",
                minHeightClass,
                !isCurrentMonth && "hidden bg-muted/50 md:flex",
                isLastColumn && "border-r-0",
                isLastRow && "border-b-0"
              )}
              onClick={(e) => {
                e.stopPropagation()
                if (didDragRecently()) return
                setDate(day)
                setMode("day")
              }}
            >
              <div
                className={cn(
                  "flex h-6 w-6 flex-col items-center justify-center rounded-full p-1 text-sm font-medium",
                  isToday && "bg-primary text-background"
                )}
              >
                {format(day, "d")}
              </div>

              <div className="mt-1 flex flex-col gap-1">
                {dayTasks.slice(0, maxVisibleEvents).map((task) => (
                  <DraggableCalendarTask
                    key={task.id}
                    task={task}
                    className="relative h-auto"
                    month
                  />
                ))}
                {dayTasks.length > maxVisibleEvents && (
                  <button
                    type="button"
                    className="cursor-pointer text-xs text-muted-foreground hover:text-foreground hover:underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDate(day)
                      setMode("day")
                    }}
                  >
                    +{dayTasks.length - maxVisibleEvents} ver todos
                  </button>
                )}
              </div>
            </CalendarDropZone>
          )
        })}
      </div>
    </div>
  )
}
