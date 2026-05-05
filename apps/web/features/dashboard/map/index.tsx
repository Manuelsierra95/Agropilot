"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { Map, MapControls, type MapRef } from "@workspace/ui/components/map"
import { Button } from "@workspace/ui/components/button"
import { Layers } from "lucide-react"
import { useTheme } from "next-themes"

import parcelsData from "./data.json"
import { mapCenter } from "./components/parcel-utils"
import { ParcelPopup } from "./components/parcel-popup"
import { ParcelsLayer } from "./components/parcels-layer"
import { SatelliteLayer } from "./components/satellite-layer"
import type { Parcel, ParcelLngLat } from "./components/types"
import { toParcelFeature } from "./components/parcel-utils"
import { Card } from "@workspace/ui/components/card"

const mockParcels = parcelsData as Parcel[]

type PopupInfo = {
  parcel: Parcel
  lngLat: ParcelLngLat
} | null

export function DashboardMap() {
  const [isSatellite, setIsSatellite] = useState(false)
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null)
  const mapRef = useRef<MapRef>(null)
  const { resolvedTheme } = useTheme()

  const mapTheme = resolvedTheme === "dark" ? "dark" : "light"

  const geojsonData = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: mockParcels.map(toParcelFeature),
    }),
    []
  )

  const handleParcelClick = useCallback(
    (parcel: Parcel, lngLat: [number, number]) => {
      setPopupInfo({ parcel, lngLat })
    },
    []
  )

  return (
    <Card className="relative col-span-1 h-[45vh] overflow-hidden p-px sm:col-span-2 md:col-span-4 lg:col-span-8">
      <div className="absolute top-3 right-3 z-10">
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
        center={mapCenter}
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
          parcels={mockParcels}
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

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/20 to-transparent px-4 py-3">
        <span className="text-[11px] text-muted-foreground drop-shadow">
          Haz clic en una parcela para ver detalles
        </span>
      </footer>
    </Card>
  )
}
