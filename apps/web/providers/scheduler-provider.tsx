"use client"

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
  useEffect,
  useMemo,
} from "react"
import {
  Action,
  Event,
  Getters,
  Handlers,
  SchedulerContextType,
  startOfWeek,
} from "@workspace/web/types/calendar"
import ModalProvider from "@workspace/web/providers/modal-context"
import {
  getDaysInMonth,
  getDaysInWeek,
  getWeekNumber,
  getEventsForDay,
  getDayName,
  handleEventStyling,
} from "@workspace/web/lib/calendar-utils"

interface SchedulerState {
  events: Event[]
}

export const variants = [
  "success",
  "primary",
  "default",
  "warning",
  "danger",
] as const

const initialState: SchedulerState = {
  events: [],
}

const schedulerReducer = (
  state: SchedulerState,
  action: Action
): SchedulerState => {
  switch (action.type) {
    case "ADD_EVENT":
      return { ...state, events: [...state.events, action.payload] }
    case "REMOVE_EVENT":
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload.id),
      }
    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        ),
      }
    case "SET_EVENTS":
      return { ...state, events: action.payload }
    default:
      return state
  }
}

const SchedulerContext = createContext<SchedulerContextType | undefined>(
  undefined
)

export const SchedulerProvider = ({
  children,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  initialState,
  weekStartsOn = "sunday",
}: {
  onAddEvent?: (event: Event) => void
  onUpdateEvent?: (event: Event) => void
  onDeleteEvent?: (id: string) => void
  weekStartsOn?: startOfWeek
  children: ReactNode
  initialState?: Event[]
}) => {
  const [state, dispatch] = useReducer(
    schedulerReducer,
    { events: initialState ?? [] }
  )

  useEffect(() => {
    if (initialState) {
      dispatch({ type: "SET_EVENTS", payload: initialState })
    }
  }, [initialState])

  const getters: Getters = useMemo(
    () => ({
      getDaysInMonth,
      getEventsForDay: (day: number, currentDate: Date) =>
        getEventsForDay(day, currentDate, state.events),
      getDaysInWeek: (week: number, year: number) =>
        getDaysInWeek(week, year, weekStartsOn),
      getWeekNumber,
      getDayName,
    }),
    [state.events, weekStartsOn]
  )

  function handleAddEvent(event: Event) {
    dispatch({ type: "ADD_EVENT", payload: event })
    if (onAddEvent) {
      onAddEvent(event)
    }
  }

  function handleUpdateEvent(event: Event, id: string) {
    dispatch({ type: "UPDATE_EVENT", payload: { ...event, id } })
    if (onUpdateEvent) {
      onUpdateEvent(event)
    }
  }

  function handleDeleteEvent(id: string) {
    dispatch({ type: "REMOVE_EVENT", payload: { id } })
    if (onDeleteEvent) {
      onDeleteEvent(id)
    }
  }

  const handlers: Handlers = useMemo(
    () => ({
      handleEventStyling,
      handleAddEvent,
      handleUpdateEvent,
      handleDeleteEvent,
    }),
    [onAddEvent, onUpdateEvent, onDeleteEvent]
  )

  return (
    <SchedulerContext.Provider
      value={{ events: state, dispatch, getters, handlers, weekStartsOn }}
    >
      <ModalProvider>{children}</ModalProvider>
    </SchedulerContext.Provider>
  )
}

export const useScheduler = () => {
  const context = useContext(SchedulerContext)
  if (!context) {
    throw new Error("useScheduler must be used within a SchedulerProvider")
  }
  return context
}
