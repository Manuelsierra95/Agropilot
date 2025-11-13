import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Parcel } from '@workspace/types/parcels'
import { CACHE_TIME } from '@/utils/constants'

interface ParcelState {
  parcelId: string | null
  parcels: Parcel[]
  selectedParcelIds: string[]
  lastFetched: number | null
  setParcelId: (id: string | null) => void
  setParcels: (parcels: Parcel[]) => void
  setSelectedParcelIds: (ids: string[]) => void
  selectAllParcels: () => void
  addParcel: (parcel: Parcel) => void
  removeParcel: (id: number) => void
  updateParcel: (id: number, parcel: Partial<Parcel>) => void
  initParcels: (parcels: Parcel[]) => void
  isStale: (maxAge?: number) => boolean
}

export const useParcelStore = create<ParcelState>()(
  persist(
    (set, get) => ({
      parcelId: null,
      parcels: [],
      selectedParcelIds: [],
      lastFetched: null,
      setParcelId: (id: string | null) => set({ parcelId: id || null }),
      setParcels: (parcels: Parcel[]) =>
        set({ parcels, lastFetched: Date.now() }),
      initParcels: (parcels: Parcel[]) =>
        set(() => ({
          parcels,
          parcelId: parcels[0]?.id?.toString() ?? null,
          lastFetched: Date.now(),
        })),
      setSelectedParcelIds: (ids: string[]) => set({ selectedParcelIds: ids }),
      selectAllParcels: () =>
        set((state) => ({
          selectedParcelIds: state.parcels.map((p) => p.id?.toString() || ''),
          parcelId: 'all',
        })),
      addParcel: (parcel: Parcel) =>
        set((state) => ({ parcels: [...state.parcels, parcel] })),
      removeParcel: (id: number) =>
        set((state) => ({
          parcels: state.parcels.filter((p) => p.id !== id),
        })),
      updateParcel: (id: number, updatedParcel: Partial<Parcel>) =>
        set((state) => ({
          parcels: state.parcels.map((p) =>
            p.id === id ? { ...p, ...updatedParcel } : p
          ),
        })),
      isStale: (maxAge = CACHE_TIME) => {
        const { lastFetched } = get()
        if (!lastFetched) return true
        return Date.now() - lastFetched > maxAge
      },
    }),
    {
      name: 'parcels-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
