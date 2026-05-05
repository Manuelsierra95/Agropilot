"use client"

import { useState } from "react"

import CalendarComponent from "@/features/calendar/calendar"
import type { CalendarEvent, Mode } from "@/features/calendar/calendar-types"

interface CalendarClientProps {
  initialEvents: CalendarEvent[]
}

export function CalendarClient({ initialEvents }: CalendarClientProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [mode, setMode] = useState<Mode>("month")
  const [date, setDate] = useState<Date>(new Date())

  return (
    <div className="col-span-1 flex h-full flex-col gap-4">
      <CalendarComponent
        events={events}
        setEvents={setEvents}
        mode={mode}
        setMode={setMode}
        date={date}
        setDate={setDate}
      />
    </div>
  )
}
