import { useCalendarContext } from "../../components/calendar/calendar-context"
import { isSameDay } from "date-fns"
import { hours } from "./calendar-body-margin-day-margin"
import CalendarBodyHeader from "../calendar-body-header"
import CalendarEvent from "../../components/calendar/calendar-event"
import { cn } from "@workspace/ui/lib/utils"

export default function CalendarBodyDayContent({
  date,
  hideBorderLeft = false,
}: {
  date: Date
  hideBorderLeft?: boolean
}) {
  const { events } = useCalendarContext()

  const dayEvents = events.filter((event) => isSameDay(event.start, date))

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

        {dayEvents.map((event) => (
          <CalendarEvent key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}
