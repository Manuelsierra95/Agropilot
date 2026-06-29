"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Map, MapControls, type MapRef } from "@workspace/ui/components/map"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { Layers } from "lucide-react"
import { useTheme } from "next-themes"

import { ParcelPopup } from "@workspace/web/components/maps/components/parcel-popup"
import { getPolygonCenter, toParcelFeature } from "@workspace/web/components/maps/components/parcel-utils"
import { ParcelsLayer } from "@workspace/web/components/maps/components/parcels-layer"
import { SatelliteLayer } from "@workspace/web/components/maps/components/satellite-layer"
import type { Parcel, ParcelLngLat } from "@workspace/web/components/maps/components/types"

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_COLOR = "#22c55e"
const FALLBACK_CENTER: [number, number] = [-4.7794, 37.8882]
const DEFAULT_ZOOM = 14
const FIT_PADDING = 60

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the axis-aligned bounding box of a set of parcels. */
function computeBounds(
  parcels: Parcel[]
): [[number, number], [number, number]] | null {
  let minLng = Infinity,
    maxLng = -Infinity,
    minLat = Infinity,
    maxLat = -Infinity

  for (const parcel of parcels) {
    for (const [lng, lat] of parcel.geometryCoordinates[0] ?? []) {
      if (lng < minLng) minLng = lng
      if (lng > maxLng) maxLng = lng
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
    }
  }

  if (!isFinite(minLng)) return null
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

/**
 * Wraps a raw GeoJSON polygon ring into a minimal Parcel so the existing
 * layer components can consume it without any changes.
 */
function polygonToParcel(
  coordinates: number[][][],
  overrides?: Partial<Omit<Parcel, "geometryType" | "geometryCoordinates">>
): Parcel {
  return {
    id: "polygon-1",
    name: "Parcela",
    area: 0,
    type: "Otro",
    color: DEFAULT_COLOR,
    ...overrides,
    geometryType: "Polygon",
    geometryCoordinates: coordinates,
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

type PopupInfo = { parcel: Parcel; lngLat: ParcelLngLat } | null

export type MapComponentProps = {
  className?: string

  /**
   * Full parcel objects. Use this when you already have structured data.
   * Takes precedence over `polygon`.
   */
  parcels?: Parcel[]

  /**
   * A single raw GeoJSON polygon (array of rings, each ring an array of
   * [lng, lat] pairs). The component wraps it in a default Parcel
   * automatically. Use `polygonParcelProps` to customise name, color, etc.
   */
  polygon?: number[][][]

  /**
   * Optional overrides applied when a raw `polygon` is converted to a Parcel
   * (e.g. `{ name: "Mi campo", color: "#f59e0b", area: 12.3 }`).
   */
  polygonParcelProps?: Partial<
    Omit<Parcel, "geometryType" | "geometryCoordinates">
  >

  /**
   * Explicit map center. When omitted the component derives it from the
   * centroid of the first parcel (or polygon).
   */
  center?: [number, number]

  /**
   * Initial zoom level. Ignored when `fitOnMount` is true (default).
   * @default 14
   */
  zoom?: number

  /**
   * Automatically fit the viewport to the bounding box of all parcels when
   * the map first loads.
   * @default true
   */
  fitOnMount?: boolean

  /** Footer hint text. */
  hint?: string

  /** Show map controls (zoom, locate, fullscreen). */
  showControls?: boolean

  /** Show "locate me" control. Implies `showControls`. */
  showLocate?: boolean

  /** Show parcel info popups on click. */
  showPopup?: boolean

  /**
   * Calls `map.resize()` when the root container size changes (e.g. resizable panels).
   */
  resizeWithContainer?: boolean

  /**
   * When set, flies the viewport to this parcel after mount or when the id changes.
   * Other parcels in `parcels` remain visible.
   */
  focusedParcelId?: string | null

  /**
   * When this value changes (e.g. after a cadastre search), refits the viewport
   * to the focused parcel or all parcels.
   */
  geometryRefitKey?: string | null
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MapComponent({
  className,
  parcels: parcelsProp,
  polygon,
  polygonParcelProps,
  center,
  zoom = DEFAULT_ZOOM,
  fitOnMount = true,
  hint = "Haz clic en una parcela para ver detalles",
  showControls = true,
  showLocate = true,
  showPopup = true,
  resizeWithContainer = false,
  focusedParcelId = null,
  geometryRefitKey = null,
}: MapComponentProps) {
  const [isSatellite, setIsSatellite] = useState(false)
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null)
  const mapRef = useRef<MapRef>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const mapTheme = resolvedTheme === "dark" ? "dark" : "light"

  // Normalise to a Parcel array regardless of which prop was supplied
  const parcels = useMemo<Parcel[]>(() => {
    if (parcelsProp?.length) return parcelsProp
    if (polygon?.length) return [polygonToParcel(polygon, polygonParcelProps)]
    return []
  }, [parcelsProp, polygon, polygonParcelProps])

  // Derive initial center: explicit prop → centroid of first parcel → fallback
  const mapCenter = useMemo<[number, number]>(() => {
    if (center) return center
    if (parcels[0]) return getPolygonCenter(parcels[0].geometryCoordinates)
    return FALLBACK_CENTER
  }, [center, parcels])

  const geojsonData = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: parcels.map(toParcelFeature),
    }),
    [parcels]
  )

  const fitToParcels = useCallback(
    (duration = 800) => {
      if (!parcels.length) return
      const bounds = computeBounds(parcels)
      if (!bounds) return
      mapRef.current?.fitBounds(bounds, { padding: FIT_PADDING, duration })
    },
    [parcels]
  )

  const flyToFocusedParcel = useCallback(
    (duration = 800) => {
      if (!focusedParcelId) return false
      const focused = parcels.find((parcel) => parcel.id === focusedParcelId)
      if (!focused) return false

      const bounds = computeBounds([focused])
      if (bounds) {
        mapRef.current?.fitBounds(bounds, { padding: FIT_PADDING, duration })
        return true
      }

      mapRef.current?.flyTo({
        center: getPolygonCenter(focused.geometryCoordinates),
        zoom: Math.max(zoom, 15),
        duration,
      })
      return true
    },
    [focusedParcelId, parcels, zoom]
  )

  // Fit viewport to all parcels on mount, or fly to focused parcel when set
  useEffect(() => {
    if (!fitOnMount) return
    if (flyToFocusedParcel()) return
    fitToParcels()
  }, [fitOnMount, fitToParcels, flyToFocusedParcel])

  useEffect(() => {
    if (!focusedParcelId) return
    flyToFocusedParcel()
  }, [focusedParcelId, flyToFocusedParcel])

  useEffect(() => {
    if (!geometryRefitKey) return
    if (flyToFocusedParcel()) return
    fitToParcels()
  }, [geometryRefitKey, flyToFocusedParcel, fitToParcels])

  useEffect(() => {
    if (!resizeWithContainer) return
    const root = containerRef.current
    if (!root) return

    let resizeFrame = 0
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(() => {
        mapRef.current?.resize()
        if (fitOnMount) {
          fitToParcels(0)
        }
      })
    })

    observer.observe(root)
    return () => {
      cancelAnimationFrame(resizeFrame)
      observer.disconnect()
    }
  }, [resizeWithContainer, fitOnMount, fitToParcels])

  const handleParcelClick = useCallback(
    (parcel: Parcel, lngLat: [number, number]) => {
      setPopupInfo({ parcel, lngLat })
    },
    []
  )

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full min-h-0 w-full", className)}
    >
    <Card className="relative h-full w-full overflow-hidden p-px ring-0">
      {/* Satellite toggle */}
      <div className="absolute top-3 right-3 z-9">
        <Button
          type="button"
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
        zoom={zoom}
        className="h-full w-full"
        theme={mapTheme}
      >
        {showControls && (
          <MapControls
            position="bottom-right"
            showZoom
            showLocate={showLocate}
            showFullscreen
          />
        )}
        <ParcelsLayer
          geojsonData={geojsonData}
          parcels={parcels}
          isSatellite={isSatellite}
          onParcelClick={handleParcelClick}
        />
        <SatelliteLayer isSatellite={isSatellite} />
        {popupInfo && showPopup && (
          <ParcelPopup
            parcel={popupInfo.parcel}
            lngLat={popupInfo.lngLat}
            onClose={() => setPopupInfo(null)}
          />
        )}
      </Map>

      {/* Footer hint */}
      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-9 bg-linear-to-t from-black/20 to-transparent px-4 py-3">
        <span className="text-[11px] text-muted-foreground drop-shadow">
          {hint}
        </span>
      </footer>
    </Card>
    </div>
  )
}
