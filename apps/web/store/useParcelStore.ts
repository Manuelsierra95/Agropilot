import { create } from "zustand"
import { mockParcels } from "@/store/mockParcels"

export interface Parcel {
  id: string
  name: string
  area: number // hectáreas
  type: string // tipo de cultivo
  geometryType: "Polygon"
  geometryCoordinates: number[][][]
}

interface ParcelStore {
  parcelId: string
  setParcelId: (id: string) => void
  selectedParcel: Parcel | undefined
}

export const useParcelStore = create<ParcelStore>((set) => ({
  parcelId: mockParcels[0]?.id ?? "",
  selectedParcel: mockParcels[0],
  setParcelId: (id: string) =>
    set({
      parcelId: id,
      selectedParcel:
        id === "all" ? undefined : mockParcels.find((p) => p.id === id),
    }),
}))
