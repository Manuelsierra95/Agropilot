"use client"

import { useState } from "react"

import CalendarComponent from "@/features/calendar/components/calendar/calendar"
import type {
  CalendarEvent,
  Mode,
} from "@/features/calendar/components/calendar/calendar-types"
import type { ForecastDay } from "@/features/calendar/components/calendar/sidecards/time-weather-card"

interface CalendarClientProps {
  initialEvents: CalendarEvent[]
  forecast?: ForecastDay[]
}

export function CalendarClient({
  initialEvents,
  forecast,
}: CalendarClientProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [mode, setMode] = useState<Mode>("month")
  const [date, setDate] = useState<Date>(new Date())

  return (
    <div className="col-span-1 flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <CalendarComponent
        events={events}
        setEvents={setEvents}
        mode={mode}
        setMode={setMode}
        date={date}
        setDate={setDate}
        forecast={forecast}
      />
    </div>
  )
}
