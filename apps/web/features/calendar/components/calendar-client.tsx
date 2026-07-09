"use client"

import { useState } from "react"

import CalendarComponent from "@workspace/web/features/calendar/components/calendar/calendar"
import type { Mode } from "@workspace/web/features/calendar/components/calendar/calendar-types"
import type { CalendarTask } from "@workspace/web/lib/calendar/types"

export interface CalendarClientProps {
  initialTasks: CalendarTask[]
}

export function CalendarClient({ initialTasks }: CalendarClientProps) {
  const [tasks, setTasks] = useState<CalendarTask[]>(initialTasks)
  const [mode, setMode] = useState<Mode>("month")
  const [date, setDate] = useState<Date>(new Date())

  return (
    <div className="col-span-1 flex flex-col gap-4">
      <CalendarComponent
        tasks={tasks}
        setTasks={setTasks}
        mode={mode}
        setMode={setMode}
        date={date}
        setDate={setDate}
      />
    </div>
  )
}
