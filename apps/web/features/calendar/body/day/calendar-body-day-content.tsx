import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import { isSameDay } from "date-fns"
import { hours } from "@workspace/web/features/calendar/body/day/calendar-body-margin-day-margin"
import CalendarBodyHeader from "@workspace/web/features/calendar/body/calendar-body-header"
import { CalendarDropZone } from "@workspace/web/features/calendar/components/calendar/calendar-drop-zone"
import { DraggableCalendarTask } from "@workspace/web/features/calendar/components/calendar/draggable-calendar-task"
import { cn } from "@workspace/ui/lib/utils"

export default function CalendarBodyDayContent({
  date,
  hideBorderLeft = false,
}: {
  date: Date
  hideBorderLeft?: boolean
}) {
  const { tasks, mode } = useCalendarContext()

  const dayTasks = tasks.filter((task) => isSameDay(task.start, date))
  const useHourlyDropZones = mode === "day" || mode === "week"

  return (
    <div
      className={cn(
        "flex flex-grow flex-col border-border/30",
        !hideBorderLeft && "border-l"
      )}
    >
      <CalendarBodyHeader date={date} />

      <CalendarDropZone
        type="day"
        date={date}
        className={cn("relative flex-1", !useHourlyDropZones && "min-h-full")}
      >
        <div className="relative flex-1">
          {[...hours].map((hour) =>
            useHourlyDropZones ? (
              <CalendarDropZone
                key={hour}
                type="hour"
                date={date}
                hour={hour}
                className="group h-32 border-b border-border/30 last:border-none"
              />
            ) : (
              <div
                key={hour}
                className="group h-32 border-b border-border/30 last:border-none"
              />
            )
          )}

          {dayTasks.map((task) => (
            <DraggableCalendarTask key={task.id} task={task} />
          ))}
        </div>
      </CalendarDropZone>
    </div>
  )
}
