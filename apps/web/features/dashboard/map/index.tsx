"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { Map, MapControls, type MapRef } from "@workspace/ui/components/map"
import { Button } from "@workspace/ui/components/button"
import { Layers } from "lucide-react"
import { useTheme } from "next-themes"

import { getPolygonCenter, mapCenter } from "./components/parcel-utils"
import { ParcelPopup } from "./components/parcel-popup"
import { ParcelsLayer } from "./components/parcels-layer"
import { SatelliteLayer } from "./components/satellite-layer"
import type { Parcel, ParcelLngLat } from "./components/types"
import { toParcelFeature } from "./components/parcel-utils"
import { Card } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

type PopupInfo = {
  parcel: Parcel
  lngLat: ParcelLngLat
} | null

export function DashboardMap({
  className,
  parcels = [],
}: {
  className?: string
  parcels?: Parcel[]
}) {
  const [isSatellite, setIsSatellite] = useState(false)
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null)
  const mapRef = useRef<MapRef>(null)
  const { resolvedTheme } = useTheme()

  const mapTheme = resolvedTheme === "dark" ? "dark" : "light"

  const center = useMemo<ParcelLngLat>(() => {
    const first = parcels[0]
    if (!first?.geometryCoordinates?.length) return mapCenter
    return getPolygonCenter(first.geometryCoordinates)
  }, [parcels])

  const geojsonData = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: parcels.map(toParcelFeature),
    }),
    [parcels]
  )

  const handleParcelClick = useCallback(
    (parcel: Parcel, lngLat: [number, number]) => {
      setPopupInfo({ parcel, lngLat })
    },
    []
  )

  return (
    <Card
      className={cn("relative h-full w-full overflow-hidden ring-0", className)}
    >
      <div className="absolute top-6 right-3 z-9">
        <Button
          variant="default"
          size="sm"
          className="border-border bg-card/90 text-foreground backdrop-blur-sm hover:bg-accent"
          onClick={() => {
            setIsSatellite((v) => !v)
            setPopupInfo(null)
          }}
        >
          <Layers />
          Satélite
        </Button>
      </div>

      {/* Map */}
      <Map
        ref={mapRef}
        center={center}
        zoom={14}
        className="h-full w-full"
        theme={mapTheme}
      >
        <MapControls
          position="bottom-right"
          showZoom
          showLocate
          showFullscreen
        />
        <ParcelsLayer
          geojsonData={geojsonData}
          parcels={parcels}
          isSatellite={isSatellite}
          onParcelClick={handleParcelClick}
        />
        <SatelliteLayer isSatellite={isSatellite} />
        {popupInfo && (
          <ParcelPopup
            parcel={popupInfo.parcel}
            lngLat={popupInfo.lngLat}
            onClose={() => setPopupInfo(null)}
          />
        )}
      </Map>
    </Card>
  )
}
