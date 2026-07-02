import CalendarBodyDayCalendar from "@workspace/web/features/calendar/body/day/calendar-body-day-calendar"
import CalendarBodyDayTasks from "@workspace/web/features/calendar/body/day/calendar-body-day-tasks"
import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import CalendarBodyDayContent from "@workspace/web/features/calendar/body/day/calendar-body-day-content"
import CalendarBodyMarginDayMargin from "@workspace/web/features/calendar/body/day/calendar-body-margin-day-margin"
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
        <CalendarBodyDayTasks />
      </ScrollArea>
    </div>
  )
}
