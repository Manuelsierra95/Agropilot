"use client"

import { useEffect, useState } from "react"

import CalendarComponent from "@workspace/web/features/calendar/components/calendar/calendar"
import type { Mode } from "@workspace/web/features/calendar/components/calendar/calendar-types"
import type { ForecastDay } from "@workspace/web/features/calendar/components/calendar/sidecards/time-weather-card"
import type { CalendarTask } from "@workspace/web/lib/calendar/types"

interface CalendarClientProps {
  initialTasks: CalendarTask[]
  forecast?: ForecastDay[]
}

export function CalendarClient({
  initialTasks,
  forecast,
}: CalendarClientProps) {
  const [tasks, setTasks] = useState<CalendarTask[]>(initialTasks)
  const [mode, setMode] = useState<Mode>("month")
  const [date, setDate] = useState<Date>(new Date())

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  return (
    <div className="col-span-1 flex h-fit min-h-0 flex-col gap-4">
      <CalendarComponent
        tasks={tasks}
        setTasks={setTasks}
        mode={mode}
        setMode={setMode}
        date={date}
        setDate={setDate}
        forecast={forecast}
      />
    </div>
  )
}
