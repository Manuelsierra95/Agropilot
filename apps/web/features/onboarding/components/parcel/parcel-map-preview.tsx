"use client"

import { useMemo } from "react"
import { MapComponent } from "@workspace/web/components/maps/map"
import { fieldFormDraftToMapParcel } from "@workspace/web/features/onboarding/components/parcel/parcel-draft-utils"
import type { FieldFormData } from "@workspace/web/features/onboarding/components/parcel/parcel-form"
import { ParcelLocationSummary } from "@workspace/web/features/onboarding/components/parcel/parcel-location-summary"

interface ParcelMapProps {
  parcels: FieldFormData[]
  activeParcelId: string
  onPolygonChange?: (parcelId: string, polygon: string | null) => void
  onCentroidChange?: (parcelId: string, centroid: string | null) => void
}

export function ParcelMap({ parcels, activeParcelId }: ParcelMapProps) {
  const activeDraft = parcels.find((parcel) => parcel.id === activeParcelId)

  const mapParcel = useMemo(() => {
    if (!activeDraft) return undefined
    return fieldFormDraftToMapParcel(activeDraft)
  }, [
    activeDraft,
    activeDraft?.polygon,
    activeDraft?.name,
    activeDraft?.cropType,
    activeDraft?.areaHa,
    activeDraft?.irrigationType,
  ])

  const activeName = activeDraft?.name.trim() || "Parcela sin nombre"
  const hasActivePolygon = Boolean(mapParcel)

  const hint = hasActivePolygon
    ? "Haz clic en la parcela para ver detalles"
    : ""

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <ParcelLocationSummary
        refcat={activeDraft?.refcat}
        address={activeDraft?.address}
      />
      <div className="box-border min-h-0 flex-1 p-4">
        <MapComponent
          className="h-full min-h-0 w-full"
          resizeWithContainer
          parcel={mapParcel}
          hint={hint}
          showControls
          showLocate={false}
          showPopup={hasActivePolygon}
        />
        {!hasActivePolygon && activeDraft ? (
          <p className="sr-only">Vista previa de {activeName}</p>
        ) : null}
      </div>
    </div>
  )
}
