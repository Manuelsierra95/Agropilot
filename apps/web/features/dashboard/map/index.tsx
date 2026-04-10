"use client"

import { useEffect, useRef, useCallback, useMemo, useState } from "react"
import type MapLibreGL from "maplibre-gl"
import {
  Map,
  useMap,
  MapPopup,
  MapControls,
} from "@workspace/ui/components/map"
import { Card } from "@workspace/ui/components/card"
import { useParcelStore, type Parcel } from "@/store/useParcelStore"
import { mockParcels } from "@/store/mockParcels"

// Estilo de mapa satelital usando Esri World Imagery como tiles raster
const satelliteStyle: MapLibreGL.StyleSpecification = {
  version: 8,
  name: "Satellite",
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    },
  },
  layers: [
    {
      id: "esri-satellite-layer",
      type: "raster",
      source: "esri-satellite",
    },
  ],
}

/**
 * Componente de mapa del dashboard usando mapcn (MapLibre GL).
 * Muestra parcelas agrícolas como polígonos GeoJSON con popups interactivos.
 */
export function DashboardMap() {
  const parcels = mockParcels

  // Calcular centro inicial a partir de las parcelas
  const initialCenter = useMemo<[number, number]>(() => {
    if (parcels.length === 0) return [-4.7794, 37.8882]
    const bounds = getAllParcelsBounds(parcels)
    if (!bounds) return [-4.7794, 37.8882]
    return [
      (bounds[0][0] + bounds[1][0]) / 2,
      (bounds[0][1] + bounds[1][1]) / 2,
    ]
  }, [parcels])

  return (
    <Card className="col-span-1 h-[45vh] overflow-hidden border-r p-0 sm:col-span-2 md:col-span-4 lg:col-span-8">
      <Map
        className="h-full w-full"
        styles={{
          light: satelliteStyle,
          dark: satelliteStyle,
        }}
        center={initialCenter}
        zoom={15}
        attributionControl={false}
      >
        <ParcelLayers parcels={parcels} />
        <MapControls
          position="bottom-right"
          showZoom
          showLocate
          showFullscreen
        />
      </Map>
    </Card>
  )
}

/**
 * Calcula el centro de un array de coordenadas GeoJSON (Polygon).
 */
function getPolygonCenter(coordinates: number[][][]): [number, number] {
  const ring = coordinates[0]
  if (!ring || ring.length === 0) return [-4.7794, 37.8882]

  let lngSum = 0
  let latSum = 0
  let count = 0

  for (const coord of ring) {
    if (Array.isArray(coord) && coord.length >= 2) {
      lngSum += coord[0]!
      latSum += coord[1]!
      count++
    }
  }

  if (count === 0) return [-4.7794, 37.8882]
  return [lngSum / count, latSum / count]
}

/**
 * Calcula los bounds de todas las parcelas.
 */
function getAllParcelsBounds(
  parcels: Parcel[]
): [[number, number], [number, number]] | null {
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity

  for (const parcel of parcels) {
    const ring = parcel.geometryCoordinates[0]
    if (!ring) continue
    for (const coord of ring) {
      if (Array.isArray(coord) && coord.length >= 2) {
        const lng = coord[0]!
        const lat = coord[1]!
        if (lng < minLng) minLng = lng
        if (lat < minLat) minLat = lat
        if (lng > maxLng) maxLng = lng
        if (lat > maxLat) maxLat = lat
      }
    }
  }

  if (!isFinite(minLng)) return null
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

/**
 * Componente interno que gestiona las capas GeoJSON de parcelas
 * usando directamente la API de MapLibre a través del hook useMap().
 */
function ParcelLayers({ parcels }: { parcels: Parcel[] }) {
  const { map, isLoaded } = useMap()
  const parcelId = useParcelStore((state) => state.parcelId)
  const setParcelId = useParcelStore((state) => state.setParcelId)
  const [popupInfo, setPopupInfo] = useState<{
    parcel: Parcel
    lngLat: [number, number]
  } | null>(null)
  const hasFittedRef = useRef(false)

  const sourceId = "parcels-source"
  const fillLayerId = "parcels-fill"
  const lineLayerId = "parcels-line"

  // GeoJSON FeatureCollection
  const geojsonData = useMemo<GeoJSON.FeatureCollection>(() => {
    return {
      type: "FeatureCollection",
      features: parcels.map((parcel) => ({
        type: "Feature" as const,
        id: Number(parcel.id),
        geometry: {
          type: parcel.geometryType,
          coordinates: parcel.geometryCoordinates,
        } as GeoJSON.Geometry,
        properties: {
          id: parcel.id,
          name: parcel.name,
          area: parcel.area,
          type: parcel.type,
        },
      })),
    }
  }, [parcels])

  // Añadir source y layers al mapa
  useEffect(() => {
    if (!isLoaded || !map) return

    // Añadir source
    map.addSource(sourceId, {
      type: "geojson",
      data: geojsonData,
    })

    // Capa de relleno
    map.addLayer({
      id: fillLayerId,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": "#10b981",
        "fill-opacity": 0.2,
      },
    })

    // Capa de línea/borde
    map.addLayer({
      id: lineLayerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": "#10b981",
        "line-width": 2,
        "line-opacity": 1,
      },
    })

    // Cursor pointer al pasar sobre parcelas
    map.on("mouseenter", fillLayerId, () => {
      map.getCanvas().style.cursor = "pointer"
    })
    map.on("mouseleave", fillLayerId, () => {
      map.getCanvas().style.cursor = ""
    })

    // Click en parcela
    const handleClick = (
      e: MapLibreGL.MapMouseEvent & {
        features?: MapLibreGL.MapGeoJSONFeature[]
      }
    ) => {
      const feature = e.features?.[0]
      if (!feature) return

      const clickedId = feature.properties?.id as string
      setParcelId(clickedId)

      const parcel = parcels.find((p) => p.id === clickedId)
      if (parcel) {
        const center = getPolygonCenter(parcel.geometryCoordinates)
        setPopupInfo({ parcel, lngLat: center })
      }
    }
    map.on("click", fillLayerId, handleClick)

    // Fit bounds inicial
    if (!hasFittedRef.current && parcels.length > 0) {
      const bounds = getAllParcelsBounds(parcels)
      if (bounds) {
        map.fitBounds(bounds, { padding: 50, duration: 0 })
        hasFittedRef.current = true
      }
    }

    return () => {
      try {
        map.off("click", fillLayerId, handleClick)
        if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId)
        if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        // ignore cleanup errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map])

  // Actualizar datos cuando cambian las parcelas
  useEffect(() => {
    if (!isLoaded || !map) return
    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource
    if (source) {
      source.setData(geojsonData)
    }
  }, [isLoaded, map, geojsonData])

  // Actualizar estilos según la parcela seleccionada
  useEffect(() => {
    if (!isLoaded || !map) return

    const selectedColor = "#3b82f6"
    const defaultColor = "#10b981"

    if (parcelId) {
      // Fill color
      map.setPaintProperty(fillLayerId, "fill-color", [
        "case",
        ["==", ["get", "id"], parcelId],
        selectedColor,
        defaultColor,
      ])
      // Line color
      map.setPaintProperty(lineLayerId, "line-color", [
        "case",
        ["==", ["get", "id"], parcelId],
        selectedColor,
        defaultColor,
      ])
      // Line width
      map.setPaintProperty(lineLayerId, "line-width", [
        "case",
        ["==", ["get", "id"], parcelId],
        3,
        2,
      ])
    } else {
      map.setPaintProperty(fillLayerId, "fill-color", defaultColor)
      map.setPaintProperty(lineLayerId, "line-color", defaultColor)
      map.setPaintProperty(lineLayerId, "line-width", 2)
    }
  }, [isLoaded, map, parcelId])

  // Volar a la parcela seleccionada
  useEffect(() => {
    if (!isLoaded || !map || !parcelId) return

    const parcel = parcels.find((p) => p.id === parcelId)
    if (!parcel) return

    const ring = parcel.geometryCoordinates[0]
    if (!ring) return

    let minLng = Infinity
    let minLat = Infinity
    let maxLng = -Infinity
    let maxLat = -Infinity

    for (const coord of ring) {
      if (Array.isArray(coord) && coord.length >= 2) {
        if (coord[0]! < minLng) minLng = coord[0]!
        if (coord[1]! < minLat) minLat = coord[1]!
        if (coord[0]! > maxLng) maxLng = coord[0]!
        if (coord[1]! > maxLat) maxLat = coord[1]!
      }
    }

    if (isFinite(minLng)) {
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 50, duration: 1500 }
      )
    }
  }, [isLoaded, map, parcelId, parcels])

  // Cerrar popup al hacer click fuera
  const handleClosePopup = useCallback(() => {
    setPopupInfo(null)
  }, [])

  return (
    <>
      {popupInfo && (
        <MapPopup
          longitude={popupInfo.lngLat[0]}
          latitude={popupInfo.lngLat[1]}
          onClose={handleClosePopup}
          closeButton
          className="min-w-[150px]"
        >
          <div>
            <h3 className="mb-2 text-sm font-semibold">
              {popupInfo.parcel.name}
            </h3>
            {popupInfo.parcel.area && (
              <p className="text-xs text-muted-foreground">
                Área: {popupInfo.parcel.area} ha
              </p>
            )}
            {popupInfo.parcel.type && (
              <p className="text-xs text-muted-foreground">
                Cultivo: {popupInfo.parcel.type}
              </p>
            )}
          </div>
        </MapPopup>
      )}
    </>
  )
}
