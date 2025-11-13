import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Event } from '@/lib/calendarData'
import { CACHE_TIME } from '@/utils/constants'

interface ParcelEventsCache {
  events: Event[]
  lastFetched: number
}

interface CalendarEventState {
  eventsByParcel: Record<string, ParcelEventsCache>
  setEvents: (events: Event[], parcelId: string) => void
  getEvents: (parcelId: string) => Event[]
  addEvent: (event: Event, parcelId: string) => void
  removeEvent: (id: string, parcelId: string) => void
  updateEvent: (id: string, event: Partial<Event>, parcelId: string) => void
  clearEvents: (parcelId?: string) => void
  isStale: (parcelId: string, maxAge?: number) => boolean
}

export const useCalendarEventStore = create<CalendarEventState>()(
  persist(
    (set, get) => ({
      eventsByParcel: {},

      setEvents: (events: Event[], parcelId: string) =>
        set((state) => ({
          eventsByParcel: {
            ...state.eventsByParcel,
            [parcelId]: {
              events,
              lastFetched: Date.now(),
            },
          },
        })),

      getEvents: (parcelId: string) => {
        const cache = get().eventsByParcel[parcelId]
        return cache?.events || []
      },

      addEvent: (event: Event, parcelId: string) =>
        set((state) => {
          const cache = state.eventsByParcel[parcelId]
          const currentEvents = cache?.events || []

          return {
            eventsByParcel: {
              ...state.eventsByParcel,
              [parcelId]: {
                events: [...currentEvents, event],
                lastFetched: cache?.lastFetched || Date.now(),
              },
            },
          }
        }),

      removeEvent: (id: string, parcelId: string) =>
        set((state) => {
          const cache = state.eventsByParcel[parcelId]
          if (!cache) return state

          return {
            eventsByParcel: {
              ...state.eventsByParcel,
              [parcelId]: {
                events: cache.events.filter((e) => e.id !== id),
                lastFetched: cache.lastFetched,
              },
            },
          }
        }),

      updateEvent: (
        id: string,
        updatedEvent: Partial<Event>,
        parcelId: string
      ) =>
        set((state) => {
          const cache = state.eventsByParcel[parcelId]
          if (!cache) return state

          return {
            eventsByParcel: {
              ...state.eventsByParcel,
              [parcelId]: {
                events: cache.events.map((e) =>
                  e.id === id ? { ...e, ...updatedEvent } : e
                ),
                lastFetched: cache.lastFetched,
              },
            },
          }
        }),

      clearEvents: (parcelId?: string) =>
        set((state) => {
          if (parcelId) {
            const { [parcelId]: _, ...rest } = state.eventsByParcel
            return { eventsByParcel: rest }
          }
          return { eventsByParcel: {} }
        }),

      isStale: (parcelId: string, maxAge = CACHE_TIME) => {
        const cache = get().eventsByParcel[parcelId]
        if (!cache) return true
        return Date.now() - cache.lastFetched > maxAge
      },
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
