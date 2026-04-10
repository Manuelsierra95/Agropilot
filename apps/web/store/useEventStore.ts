import { create } from "zustand"
import { mockEvents, Event } from "@/store/mockEvents"

interface TodayEventStore {
  events: Event[]
  getEvents: (parcelId?: string) => Event[]
  addEvent: (event: Event, parcelId: string) => void
}

export const useTodayEventStore = create<TodayEventStore>((set, get) => ({
  events: mockEvents,

  getEvents: (parcelId?: string) => {
    if (!parcelId) return get().events
    return get().events.filter((event) => event.parcelId === parcelId)
  },

  addEvent: (event: Event, parcelId: string) => {
    set((state) => ({
      events: [...state.events, { ...event, parcelId }],
    }))
  },
}))
