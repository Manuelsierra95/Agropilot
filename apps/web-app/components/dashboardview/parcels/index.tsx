'use client'

import { useParcelStore } from '@/store/useParcelStore'
import { ParcelCombobox } from '@/components/Combobox'
import { useGetParcels } from '@/hooks/useGetParcels'

export function Parcel() {
  const { parcels, isLoading, error } = useGetParcels()
  const parcelId = useParcelStore((state) => state.parcelId)
  const setParcelId = useParcelStore((state) => state.setParcelId)

  const parcelItems = parcels.map((parcel) => ({
    id: parcel.id?.toString() || '',
    name: parcel.name,
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <span className="text-sm text-muted-foreground">
          Cargando parcelas...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <span className="text-sm text-destructive">{error}</span>
      </div>
    )
  }

  return (
    <ParcelCombobox
      parcels={parcelItems}
      selectedParcelId={parcelId}
      onSelectParcel={setParcelId}
    />
  )
}
