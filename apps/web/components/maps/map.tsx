"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  Map,
  MapControls,
  useMap,
  type MapRef,
} from "@workspace/ui/components/map"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { Layers } from "lucide-react"
import { useTheme } from "next-themes"

import { ParcelPopup } from "@workspace/web/components/maps/components/parcel-popup"
import {
  getPolygonCenter,
  toParcelFeature,
} from "@workspace/web/components/maps/components/parcel-utils"
import { ParcelsLayer } from "@workspace/web/components/maps/components/parcels-layer"
import { SatelliteLayer } from "@workspace/web/components/maps/components/satellite-layer"
import type {
  Parcel,
  ParcelLngLat,
} from "@workspace/web/components/maps/components/types"

const FALLBACK_CENTER: [number, number] = [-4.7794, 37.8882]
const DEFAULT_ZOOM = 14
const FIT_PADDING = 60

function computeBounds(
  parcel: Parcel
): [[number, number], [number, number]] | null {
  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  for (const [lng, lat] of parcel.geometryCoordinates[0] ?? []) {
    if (typeof lng !== "number" || typeof lat !== "number") continue
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }

  if (!isFinite(minLng)) return null
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

type PopupInfo = { parcel: Parcel; lngLat: ParcelLngLat } | null

export type MapComponentProps = {
  className?: string
  parcel?: Parcel
  center?: [number, number]
  zoom?: number
  hint?: string
  showControls?: boolean
  showLocate?: boolean
  showPopup?: boolean
  resizeWithContainer?: boolean
}

function FitParcelViewport({ parcel }: { parcel: Parcel }) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded) return

    const bounds = computeBounds(parcel)
    if (!bounds) return

    const fit = () => {
      map.resize()
      map.fitBounds(bounds, { padding: FIT_PADDING, duration: 800 })
    }

    if (map.isStyleLoaded()) {
      fit()
      return
    }

    map.once("style.load", fit)
    return () => {
      map.off("style.load", fit)
    }
  }, [isLoaded, map, parcel])

  return null
}

export function MapComponent({
  className,
  parcel,
  center,
  zoom = DEFAULT_ZOOM,
  hint = "Haz clic en una parcela para ver detalles",
  showControls = true,
  showLocate = true,
  showPopup = true,
  resizeWithContainer = false,
}: MapComponentProps) {
  const [isSatellite, setIsSatellite] = useState(false)
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null)
  const mapRef = useRef<MapRef>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const mapTheme = resolvedTheme === "dark" ? "dark" : "light"

  const mapCenter = useMemo<[number, number]>(() => {
    if (center) return center
    if (parcel) return getPolygonCenter(parcel.geometryCoordinates)
    return FALLBACK_CENTER
  }, [center, parcel])

  const geojsonData = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: parcel ? [toParcelFeature(parcel)] : [],
    }),
    [parcel]
  )

  useEffect(() => {
    if (!resizeWithContainer) return
    const root = containerRef.current
    if (!root) return

    let resizeFrame = 0
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(() => {
        const map = mapRef.current
        if (!map) return

        map.resize()

        if (!parcel) return
        const bounds = computeBounds(parcel)
        if (!bounds) return
        map.fitBounds(bounds, { padding: FIT_PADDING, duration: 0 })
      })
    })

    observer.observe(root)
    return () => {
      cancelAnimationFrame(resizeFrame)
      observer.disconnect()
    }
  }, [resizeWithContainer, parcel])

  const handleParcelClick = useCallback(
    (clickedParcel: Parcel, lngLat: ParcelLngLat) => {
      setPopupInfo({ parcel: clickedParcel, lngLat })
    },
    []
  )

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full min-h-0 w-full", className)}
    >
      <Card className="relative h-full w-full overflow-hidden p-px ring-0">
        <div className="absolute top-3 right-3 z-9">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="border-border bg-card/90 text-foreground backdrop-blur-sm hover:bg-accent"
            onClick={() => {
              setIsSatellite((value) => !value)
              setPopupInfo(null)
            }}
          >
            <Layers />
            Satélite
          </Button>
        </div>

        <Map
          ref={mapRef}
          center={mapCenter}
          zoom={zoom}
          className="h-full w-full"
          theme={mapTheme}
        >
          {showControls ? (
            <MapControls
              position="bottom-right"
              showZoom
              showLocate={showLocate}
              showFullscreen
            />
          ) : null}
          {parcel ? (
            <>
              <FitParcelViewport parcel={parcel} />
              <ParcelsLayer
                geojsonData={geojsonData}
                parcel={parcel}
                isSatellite={isSatellite}
                onParcelClick={handleParcelClick}
              />
            </>
          ) : null}
          <SatelliteLayer isSatellite={isSatellite} />
          {popupInfo && showPopup ? (
            <ParcelPopup
              parcel={popupInfo.parcel}
              lngLat={popupInfo.lngLat}
              onClose={() => setPopupInfo(null)}
            />
          ) : null}
        </Map>

        {hint ? (
          <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-9 bg-linear-to-t from-black/20 to-transparent px-4 py-3">
            <span className="text-[11px] text-muted-foreground drop-shadow">
              {hint}
            </span>
          </footer>
        ) : null}
      </Card>
    </div>
  )
}
