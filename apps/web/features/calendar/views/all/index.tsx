"use client"

import { useMemo } from "react"

import {
  CalendarClient,
  type CalendarClientProps,
} from "@workspace/web/features/calendar/components/calendar-client"

export type CalendarAllViewProps = CalendarClientProps

export function CalendarAllView({ initialTasks }: CalendarAllViewProps) {
  const key = useMemo(
    () => initialTasks.map((task) => task.id).join(","),
    [initialTasks]
  )

  return <CalendarClient key={key} initialTasks={initialTasks} />
}
