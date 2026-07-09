"use client"

import { useEffect } from "react"

import {
  Mode,
  calendarModes,
  calendarMobilesModes,
} from "@workspace/web/features/calendar/components/calendar/calendar-types"
import { useCalendarContext } from "@workspace/web/features/calendar/components/calendar/calendar-context"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"

const filterLabels: Record<string, string> = {
  day: "Hoy",
  week: "Semana",
  month: "Mes",
}

export default function CalendarHeaderActionsMode() {
  const { mode, setMode } = useCalendarContext()
  const isMobile = useIsMobile()
  const visibleModes = isMobile ? calendarMobilesModes : calendarModes

  useEffect(() => {
    if (isMobile && mode === "week") {
      setMode("day")
    }
  }, [isMobile, mode, setMode])

  return (
    <div className="flex gap-1 rounded-md bg-muted p-1">
      {visibleModes.map((modeValue) => {
        const isSelected = mode === modeValue
        return (
          <button
            key={modeValue}
            onClick={() => setMode(modeValue as Mode)}
            className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all ${
              isSelected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {filterLabels[modeValue]}
          </button>
        )
      })}
    </div>
  )
}
