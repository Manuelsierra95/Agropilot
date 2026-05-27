import CalendarBodyDayCalendar from "./calendar-body-day-calendar"
import CalendarBodyDayEvents from "./calendar-body-day-events"
import { useCalendarContext } from "../../components/calendar/calendar-context"
import CalendarBodyDayContent from "./calendar-body-day-content"
import CalendarBodyMarginDayMargin from "./calendar-body-margin-day-margin"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

export default function CalendarBodyDay() {
  const { date } = useCalendarContext()
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <ScrollArea className="h-full min-h-0 w-full flex-1">
        <div className="relative flex min-h-0 flex-1">
          <CalendarBodyMarginDayMargin />
          <CalendarBodyDayContent date={date} />
        </div>
      </ScrollArea>
    </div>
  )
}
