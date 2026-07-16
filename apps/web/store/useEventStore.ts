import { create } from "zustand"
import { mockEvents, FarmEvent } from "@workspace/web/store/mockEvents"

interface TodayEventStore {
  events: FarmEvent[]
  getEvents: (parcelId?: string) => FarmEvent[]
  addEvent: (event: FarmEvent, parcelId: string) => void
}

export const useTodayEventStore = create<TodayEventStore>((set, get) => ({
  events: mockEvents,

  getEvents: (parcelId?: string) => {
    if (!parcelId) return get().events
    return get().events.filter((event) => event.parcelId === parcelId)
  },

  addEvent: (event: FarmEvent, parcelId: string) => {
    set((state) => ({
      events: [...state.events, { ...event, parcelId }],
    }))
  },
}))
