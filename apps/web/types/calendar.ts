export type startOfWeek = "sunday" | "monday"

export interface Event {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  type: string
  color?: string
}

export type Action =
  | { type: "ADD_EVENT"; payload: Event }
  | { type: "REMOVE_EVENT"; payload: { id: string } }
  | { type: "UPDATE_EVENT"; payload: Event & { id: string } }
  | { type: "SET_EVENTS"; payload: Event[] }

export interface Getters {
  getDaysInMonth: (
    month: number,
    year: number
  ) => Array<{ day: number; events: Event[] }>
  getEventsForDay: (day: number, currentDate: Date) => Event[]
  getDaysInWeek: (week: number, year: number) => Date[]
  getWeekNumber: (date: Date) => number
  getDayName: (day: number) => string
}

export interface Handlers {
  handleEventStyling: (
    event: Event,
    dayEvents: Event[],
    periodOptions?: {
      eventsInSamePeriod?: number
      periodIndex?: number
      adjustForPeriod?: boolean
    }
  ) => {
    height: string
    top: string
    zIndex: number
    left: string
    maxWidth: string
    minWidth: string
  }
  handleAddEvent: (event: Event) => void
  handleUpdateEvent: (event: Event, id: string) => void
  handleDeleteEvent: (id: string) => void
}

export interface SchedulerContextType {
  events: { events: Event[] }
  dispatch: React.Dispatch<Action>
  getters: Getters
  handlers: Handlers
  weekStartsOn: startOfWeek
}
