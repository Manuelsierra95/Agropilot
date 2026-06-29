import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area"
import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import CalendarBodyDay from "@workspace/web/features/calendar/body/day/calendar-body-day"
import CalendarBodyWeek from "@workspace/web/features/calendar/body/week/calendar-body-week"
import CalendarBodyMonth from "@workspace/web/features/calendar/body/month/calendar-body-month"

export default function CalendarBody() {
  const { mode } = useCalendarContext()

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden border-x border-y border-border/30 text-muted-foreground">
      {mode === "day" ? (
        <CalendarBodyDay />
      ) : (
        <ScrollArea className="min-h-0 w-full flex-1">
          {mode === "week" && (
            <div className="hidden md:block">
              <CalendarBodyWeek />
            </div>
          )}
          {mode === "month" && <CalendarBodyMonth maxVisibleEvents={4} />}
          <ScrollBar orientation="vertical" />
          {mode === "week" && (
            <ScrollBar orientation="horizontal" className="md:hidden" />
          )}
        </ScrollArea>
      )}
    </div>
  )
}
