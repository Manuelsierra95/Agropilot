import CalendarBodyDayCalendar from "./calendar-body-day-calendar"
import CalendarBodyDayEvents from "./calendar-body-day-events"
import { useCalendarContext } from "../../calendar-context"
import CalendarBodyDayContent from "./calendar-body-day-content"
import CalendarBodyMarginDayMargin from "./calendar-body-margin-day-margin"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

export default function CalendarBodyDay() {
  const { date } = useCalendarContext()
  return (
    <div className="flex max-h-[calc(100vh-160px)] flex-grow overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="relative flex flex-1">
          <CalendarBodyMarginDayMargin />
          <CalendarBodyDayContent date={date} />
        </div>
      </ScrollArea>

      <div className="sticky top-0 hidden max-w-fit flex-shrink-0 flex-col border-l lg:flex">
        <ScrollArea className="flex-1">
          <div className="flex flex-col divide-y pr-4">
            <CalendarBodyDayCalendar />
            <CalendarBodyDayEvents />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
