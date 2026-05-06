import { useCalendarContext } from "../../calendar-context"
import { startOfWeek, addDays } from "date-fns"
import CalendarBodyMarginDayMargin from "../day/calendar-body-margin-day-margin"
import CalendarBodyDayContent from "../day/calendar-body-day-content"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

export default function CalendarBodyWeek() {
  const { date } = useCalendarContext()

  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="flex max-h-[calc(100vh-160px)] flex-grow overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="relative flex flex-1 flex-col md:flex-row">
          <CalendarBodyMarginDayMargin className="hidden md:block" />
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className="flex flex-1 border-t md:border-t-0 md:border-l"
            >
              <CalendarBodyMarginDayMargin className="block md:hidden" />
              <CalendarBodyDayContent date={day} hideBorderLeft />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
