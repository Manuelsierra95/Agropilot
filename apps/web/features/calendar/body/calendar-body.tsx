import { useCalendarContext } from "../calendar-context"
import CalendarBodyDay from "./day/calendar-body-day"
import CalendarBodyWeek from "./week/calendar-body-week"
import CalendarBodyMonth from "./month/calendar-body-month"

export default function CalendarBody() {
  const { mode } = useCalendarContext()

  return (
    <div className="border-t border-l">
      {mode === "day" && <CalendarBodyDay />}
      {mode === "week" && <CalendarBodyWeek />}
      {mode === "month" && <CalendarBodyMonth />}
    </div>
  )
}
