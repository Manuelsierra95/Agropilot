import { createContext, useContext } from 'react'
import type { CalendarContextType } from '@workspace/web/features/calendar/components/calendar/calendar-types'

export const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
)

export function useCalendarContext() {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider')
  }
  return context
}
