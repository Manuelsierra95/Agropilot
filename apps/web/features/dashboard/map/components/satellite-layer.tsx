"use client"

import { useEffect } from "react"

import { useMap } from "@workspace/ui/components/map"

export const satelliteSourceId = "esri-satellite"
export const satelliteLayerId = "satellite-layer"

type SatelliteLayerProps = {
  isSatellite: boolean
}

export function SatelliteLayer({ isSatellite }: SatelliteLayerProps) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded) return

    if (!map.getSource(satelliteSourceId)) {
      map.addSource(satelliteSourceId, {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        maxzoom: 19,
      })
    }

    if (!map.getLayer(satelliteLayerId)) {
      map.addLayer(
        {
          id: satelliteLayerId,
          type: "raster",
          source: satelliteSourceId,
          layout: { visibility: "none" },
        },
        map.getLayer("parcels-fill") ? "parcels-fill" : undefined
      )
    }
  }, [isLoaded, map])

  useEffect(() => {
    if (!map || !isLoaded || !map.getLayer(satelliteLayerId)) return

    map.setLayoutProperty(
      satelliteLayerId,
      "visibility",
      isSatellite ? "visible" : "none"
    )
  }, [isLoaded, isSatellite, map])

  return null
}
