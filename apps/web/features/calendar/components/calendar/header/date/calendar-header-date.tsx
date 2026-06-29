import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import { format } from "date-fns"
import CalendarHeaderDateIcon from "@workspace/web/features/calendar/components/calendar/header/date/calendar-header-date-icon"
import CalendarHeaderDateChevrons from "@workspace/web/features/calendar/components/calendar/header/date/calendar-header-date-chevrons"
import CalendarHeaderDateBadge from "@workspace/web/features/calendar/components/calendar/header/date/calendar-header-date-badge"

export default function CalendarHeaderDate() {
  const { date } = useCalendarContext()
  return (
    <div className="flex items-center gap-2 text-primary">
      <CalendarHeaderDateIcon />
      <div>
        <div className="flex items-center gap-1">
          <p className="text-lg font-semibold">{format(date, "MMMM yyyy")}</p>
          <CalendarHeaderDateBadge />
        </div>
        <CalendarHeaderDateChevrons />
      </div>
    </div>
  )
}
