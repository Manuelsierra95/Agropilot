import { CalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import type { CalendarEvent, Mode } from "@workspace/web/features/calendar/components/calendar/calendar-types"
import type { ForecastDay } from "@workspace/web/features/calendar/components/calendar/sidecards/time-weather-card"
import { useState } from "react"
import CalendarNewEventDialog from "@workspace/web/features/calendar/components/calendar/dialog/calendar-new-event-dialog"
import CalendarManageEventDialog from "@workspace/web/features/calendar/components/calendar/dialog/calendar-manage-event-dialog"

export default function CalendarProvider({
  events,
  setEvents,
  mode,
  setMode,
  date,
  setDate,
  calendarIconIsToday = true,
  forecast,
  children,
}: {
  events: CalendarEvent[]
  setEvents: (events: CalendarEvent[]) => void
  mode: Mode
  setMode: (mode: Mode) => void
  date: Date
  setDate: (date: Date) => void
  calendarIconIsToday: boolean
  forecast?: ForecastDay[]
  children: React.ReactNode
}) {
  const [newEventDialogOpen, setNewEventDialogOpen] = useState(false)
  const [manageEventDialogOpen, setManageEventDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  return (
    <CalendarContext.Provider
      value={{
        events,
        setEvents,
        mode,
        setMode,
        date,
        setDate,
        calendarIconIsToday,
        newEventDialogOpen,
        setNewEventDialogOpen,
        manageEventDialogOpen,
        setManageEventDialogOpen,
        selectedEvent,
        setSelectedEvent,
        forecast,
      }}
    >
      <CalendarNewEventDialog />
      <CalendarManageEventDialog />
      {children}
    </CalendarContext.Provider>
  )
}
