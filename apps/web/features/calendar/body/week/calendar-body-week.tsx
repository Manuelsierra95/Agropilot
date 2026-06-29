import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import { startOfWeek, addDays } from "date-fns"
import CalendarBodyMarginDayMargin from "@workspace/web/features/calendar/body/day/calendar-body-margin-day-margin"
import CalendarBodyDayContent from "@workspace/web/features/calendar/body/day/calendar-body-day-content"

export default function CalendarBodyWeek() {
  const { date } = useCalendarContext()

  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="relative flex min-w-max flex-col md:min-w-0 md:flex-row">
      <CalendarBodyMarginDayMargin className="hidden md:block" />
      {weekDays.map((day) => (
        <div
          key={day.toISOString()}
          className="flex w-full flex-none border-border/30 md:w-auto md:flex-1 md:border-l"
        >
          <CalendarBodyMarginDayMargin className="block md:hidden" />
          <CalendarBodyDayContent date={day} hideBorderLeft />
        </div>
      ))}
    </div>
  )
}
