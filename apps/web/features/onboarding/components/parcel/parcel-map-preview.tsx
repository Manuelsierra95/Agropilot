"use client"

import { useMemo } from "react"
import { MapComponent } from "@/components/maps/map"
import { fieldFormDraftsToMapParcels } from "./parcel-draft-utils"
import type { FieldFormData } from "./parcel-form"
import { ParcelLocationSummary } from "./parcel-location-summary"

interface ParcelMapProps {
  parcels: FieldFormData[]
  activeParcelId: string
  onPolygonChange?: (parcelId: string, polygon: string | null) => void
  onCentroidChange?: (parcelId: string, centroid: string | null) => void
}

export function ParcelMap({ parcels, activeParcelId }: ParcelMapProps) {
  const mapParcels = useMemo(
    () => fieldFormDraftsToMapParcels(parcels, activeParcelId),
    [parcels, activeParcelId]
  )

  const activeDraft = parcels.find((parcel) => parcel.id === activeParcelId)
  const activeName = activeDraft?.name.trim() || "Parcela sin nombre"
  const hasAnyPolygon = mapParcels.length > 0

  const hint =
    parcels.length > 1
      ? hasAnyPolygon
        ? "Parcela activa resaltada en verde. Pantalla completa para ver todas."
        : "Usa el buscador para localizar la parcela activa."
      : hasAnyPolygon
        ? "Haz clic en una parcela para ver detalles"
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
          fitOnMount
          hint={hint}
          showControls
          showLocate={false}
          showPopup={mapParcels.length > 0} // TODO: Mostrar solo info de la parcela, no mostrar el boton de ver detalle (dejar solo el boton de cerrar)
        />
        {!hasAnyPolygon && activeDraft ? (
          <p className="sr-only">Vista previa de {activeName}</p>
        ) : null}
      </div>
    </div>
  )
}
