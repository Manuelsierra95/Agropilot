"use client"

import { useEffect, useState } from "react"

import CalendarComponent from "@workspace/web/features/calendar/components/calendar/calendar"
import type { Mode } from "@workspace/web/features/calendar/components/calendar/calendar-types"
import type { ForecastDay } from "@workspace/web/features/calendar/components/calendar/sidecards/time-weather-card"
import type { CalendarEvent } from "@workspace/web/lib/calendar/types"

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

  useEffect(() => {
    setEvents(initialEvents)
  }, [initialEvents])

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
