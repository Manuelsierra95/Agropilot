import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area"
import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import CalendarBodyDay from "@workspace/web/features/calendar/body/day/calendar-body-day"
import CalendarBodyWeek from "@workspace/web/features/calendar/body/week/calendar-body-week"
import CalendarBodyMonth from "@workspace/web/features/calendar/body/month/calendar-body-month"

export default function CalendarBody() {
  const { mode } = useCalendarContext()

  return (
    <div className="flex flex-col border-x border-y border-border/30 text-muted-foreground">
      {mode === "day" ? (
        <CalendarBodyDay />
      ) : mode === "month" ? (
        <CalendarBodyMonth maxVisibleEvents={4} />
      ) : (
        <ScrollArea className="min-h-0 w-full">
          <div className="hidden md:block">
            <CalendarBodyWeek />
          </div>
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" className="md:hidden" />
        </ScrollArea>
      )}
    </div>
  )
}
