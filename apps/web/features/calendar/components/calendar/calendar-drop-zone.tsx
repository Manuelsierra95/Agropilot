"use client"

import { useDroppable } from "@dnd-kit/core"
import { format } from "date-fns"

import { cn } from "@workspace/ui/lib/utils"

export type CalendarDropZoneType = "day" | "hour"

export type CalendarDropZoneData = {
  type: CalendarDropZoneType
  date: Date
  hour?: number
}

function buildDropZoneId(data: CalendarDropZoneData): string {
  const dateKey = format(data.date, "yyyy-MM-dd")
  if (data.type === "hour" && data.hour !== undefined) {
    return `calendar-hour:${dateKey}:${data.hour}`
  }
  return `calendar-day:${dateKey}`
}

type CalendarDropZoneProps = {
  type: CalendarDropZoneType
  date: Date
  hour?: number
  className?: string
  children?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

export function CalendarDropZone({
  type,
  date,
  hour,
  className,
  children,
  onClick,
}: CalendarDropZoneProps) {
  const data: CalendarDropZoneData = { type, date, hour }
  const { isOver, setNodeRef } = useDroppable({
    id: buildDropZoneId(data),
    data,
  })

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        "transition-colors",
        isOver && "bg-primary/5 ring-2 ring-primary/40 ring-inset",
        className
      )}
    >
      {children}
    </div>
  )
}
