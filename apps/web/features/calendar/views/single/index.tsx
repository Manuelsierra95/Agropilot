"use client"

import { useMemo } from "react"

import { CalendarClient } from "@workspace/web/features/calendar/components/calendar-client"
import type { CalendarClientProps } from "@workspace/web/features/calendar/components/calendar-client"

export type CalendarSingleViewProps = CalendarClientProps

export function CalendarSingleView({ initialTasks }: CalendarSingleViewProps) {
  const key = useMemo(
    () => initialTasks.map((task) => task.id).join(","),
    [initialTasks]
  )

  return <CalendarClient key={key} initialTasks={initialTasks} />
}
