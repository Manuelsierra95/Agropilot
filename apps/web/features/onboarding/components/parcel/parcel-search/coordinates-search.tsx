"use client"

import { useCallback, useEffect, useState } from "react"
import { MapPin } from "lucide-react"
import type MapLibreGL from "maplibre-gl"
import type { MapMouseEvent } from "maplibre-gl"
import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
  useMap,
} from "@workspace/ui/components/map"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"

import { MapPlaceSearch } from "@workspace/web/features/onboarding/components/parcel/parcel-search/map-place-search"

const MAP_MAX_ZOOM_IN = 19

const satelliteStyle: MapLibreGL.StyleSpecification = {
  version: 8,
  sources: {
    esriSatellite: {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: MAP_MAX_ZOOM_IN,
      attribution: "Tiles &copy; Esri",
    },
    esriReference: {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Labels & boundaries &copy; Esri",
    },
  },
  layers: [
    {
      id: "esri-satellite-layer",
      type: "raster",
      source: "esriSatellite",
    },
    {
      id: "esri-reference-layer",
      type: "raster",
      source: "esriReference",
    },
  ],
}

function MapResizeOnOpen({ isOpen }: { isOpen: boolean }) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!isOpen || !map || !isLoaded) return

    const resize = () => map.resize()

    const frame = requestAnimationFrame(resize)
    const timeoutId = window.setTimeout(resize, 150)

    const container = map.getContainer()
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(resize)
    })
    observer.observe(container)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [isOpen, map, isLoaded])

  return null
}

function MapClickHandler({
  onMapClick,
  disabled,
}: {
  onMapClick: (lat: number, lng: number) => void
  disabled: boolean
}) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded || disabled) return

    const handleClick = (e: MapMouseEvent) => {
      const { lng, lat } = e.lngLat
      onMapClick(lat, lng)
    }

    map.on("click", handleClick)

    return () => {
      map.off("click", handleClick)
    }
  }, [map, isLoaded, onMapClick, disabled])

  return null
}

function MapPickerContent({
  isOpen,
  isLoading,
  disabled,
  selectedCoords,
  onMapClick,
}: {
  isOpen: boolean
  isLoading: boolean
  disabled: boolean
  selectedCoords: { lat: number; lng: number } | null
  onMapClick: (lat: number, lng: number) => void
}) {
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border">
      <Map
        center={[-3.7038, 40.4168]}
        zoom={6}
        attributionControl={false}
        styles={{ light: satelliteStyle, dark: satelliteStyle }}
        className="h-full w-full"
      >
        <MapResizeOnOpen isOpen={isOpen} />
        <MapPlaceSearch />
        <MapClickHandler
          onMapClick={onMapClick}
          disabled={isLoading || disabled}
        />
        <MapControls
          showZoom
          showLocate
          showFullscreen
          position="bottom-right"
        />
        {selectedCoords ? (
          <MapMarker
            longitude={selectedCoords.lng}
            latitude={selectedCoords.lat}
          >
            <MarkerContent>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <MapPin className="h-5 w-5" />
              </div>
            </MarkerContent>
          </MapMarker>
        ) : null}
      </Map>
    </div>
  )
}

interface CoordinatesSearchProps {
  onSearch: (lat: number, lng: number) => void
  isLoading: boolean
  disabled?: boolean
}

export function CoordinatesSearch({
  onSearch,
  isLoading,
  disabled = false,
}: CoordinatesSearchProps) {
  const [open, setOpen] = useState(false)
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (isLoading || disabled) return
      setSelectedCoords({ lat, lng })
      onSearch(lat, lng)
      setOpen(false)
    },
    [disabled, isLoading, onSearch]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="text-pretty">
          Abre el mapa, busca una ubicación y haz clic para seleccionar la
          parcela.
        </span>
      </div>

      {selectedCoords ? (
        <div className="rounded-lg bg-muted p-3 text-sm">
          <span className="font-medium">Coordenadas seleccionadas:</span>{" "}
          <code className="rounded bg-card px-1.5 py-0.5">
            {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
          </code>
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            className="w-full bg-primary/10 text-primary hover:bg-primary/20"
            disabled={disabled || isLoading}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Abrir mapa
          </Button>
        </DialogTrigger>
        <DialogContent
          className="inset-0 flex h-[100dvh] max-h-none w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-3 rounded-none border-0 p-3 sm:max-w-none sm:p-4"
          showCloseButton
        >
          <DialogHeader className="shrink-0 space-y-1 pb-0">
            <DialogTitle>Seleccionar ubicación</DialogTitle>
            <DialogDescription>
              Busca un lugar o haz clic en el mapa para localizar la parcela.
            </DialogDescription>
          </DialogHeader>

          <MapPickerContent
            isOpen={open}
            isLoading={isLoading}
            disabled={disabled}
            selectedCoords={selectedCoords}
            onMapClick={handleMapClick}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
