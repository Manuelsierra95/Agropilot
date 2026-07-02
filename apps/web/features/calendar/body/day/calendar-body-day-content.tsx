import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import { isSameDay } from "date-fns"
import { hours } from "@workspace/web/features/calendar/body/day/calendar-body-margin-day-margin"
import CalendarBodyHeader from "@workspace/web/features/calendar/body/calendar-body-header"
import CalendarTask from "@workspace/web/features/calendar/components/calendar/calendar-task"
import { cn } from "@workspace/ui/lib/utils"

export default function CalendarBodyDayContent({
  date,
  hideBorderLeft = false,
}: {
  date: Date
  hideBorderLeft?: boolean
}) {
  const { tasks } = useCalendarContext()

  const dayTasks = tasks.filter((task) => isSameDay(task.start, date))

  return (
    <div
      className={cn(
        "flex flex-grow flex-col border-border/30",
        !hideBorderLeft && "border-l"
      )}
    >
      <CalendarBodyHeader date={date} />

      <div className="relative flex-1">
        {[...hours].map((hour) => (
          <div
            key={hour}
            className="group h-32 border-b border-border/30 last:border-none"
          />
        ))}

        {dayTasks.map((task) => (
          <CalendarTask key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
