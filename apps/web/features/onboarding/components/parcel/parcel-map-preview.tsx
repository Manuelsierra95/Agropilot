"use client"

import { useMemo } from "react"
import { MapComponent } from "@workspace/web/components/maps/map"
import { fieldFormDraftsToMapParcels } from "@workspace/web/features/onboarding/components/parcel/parcel-draft-utils"
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

  const mapParcels = useMemo(() => {
    if (!activeDraft) return []
    return fieldFormDraftsToMapParcels([activeDraft], activeParcelId)
  }, [activeDraft, activeParcelId])

  const activeName = activeDraft?.name.trim() || "Parcela sin nombre"
  const hasActivePolygon = mapParcels.length > 0

  const hint = hasActivePolygon
    ? "Haz clic en la parcela para ver detalles"
    : "Usa el buscador para localizar la parcela en el mapa"

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
          parcels={mapParcels.length > 0 ? mapParcels : undefined}
          focusedParcelId={activeParcelId}
          geometryRefitKey={activeDraft?.polygon ?? null}
          fitOnMount
          hint={hint}
          showControls
          showLocate={false}
          showPopup={mapParcels.length > 0} // TODO: Mostrar solo info de la parcela, no mostrar el boton de ver detalle (dejar solo el boton de cerrar)
        />
        {!hasActivePolygon && activeDraft ? (
          <p className="sr-only">Vista previa de {activeName}</p>
        ) : null}
      </div>
    </div>
  )
}
