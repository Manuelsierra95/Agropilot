import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Event } from '@/lib/calendarData'
import { CACHE_TIME } from '@/utils/constants'

interface EventState {
  events: Event[]
  lastFetched: number | null
  parcelId: string | null
  setEvents: (events: Event[], parcelId: string) => void
  addEvent: (event: Event) => void
  removeEvent: (id: string) => void
  updateEvent: (id: string, event: Partial<Event>) => void
  clearEvents: () => void
  isStale: (maxAge?: number) => boolean
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],
      lastFetched: null,
      parcelId: null,
      setEvents: (events: Event[], parcelId: string) =>
        set({ events, lastFetched: Date.now(), parcelId }),
      addEvent: (event: Event) =>
        set((state) => ({ events: [...state.events, event] })),
      removeEvent: (id: string) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),
      updateEvent: (id: string, updatedEvent: Partial<Event>) =>
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...updatedEvent } : e
          ),
        })),
      clearEvents: () => set({ events: [], lastFetched: null, parcelId: null }),
      isStale: (maxAge = CACHE_TIME) => {
        const { lastFetched } = get()
        if (!lastFetched) return true
        return Date.now() - lastFetched > maxAge
      },
    }),
    {
      name: 'events-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
