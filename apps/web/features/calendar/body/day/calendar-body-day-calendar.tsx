import { useCalendarContext } from "../../components/calendar/calendar-context"
import { Calendar } from "@workspace/ui/components/calendar"

export default function CalendarBodyDayCalendar() {
  const { date, setDate } = useCalendarContext()
  return (
    <Calendar
      selected={date}
      onSelect={(date: Date | undefined) => date && setDate(date)}
      mode="single"
    />
  )
}
