"use client"

import { useEffect } from "react"

import { useMap } from "@workspace/ui/components/map"

import { getPolygonCenter } from "@workspace/web/components/maps/components/parcel-utils"
import type {
  Parcel,
  ParcelLngLat,
} from "@workspace/web/components/maps/components/types"

type ParcelsLayerProps = {
  geojsonData: GeoJSON.FeatureCollection
  parcels: Parcel[]
  isSatellite: boolean
  onParcelClick: (parcel: Parcel, lngLat: ParcelLngLat) => void
}

export function ParcelsLayer({
  geojsonData,
  parcels,
  isSatellite,
  onParcelClick,
}: ParcelsLayerProps) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded || !map.isStyleLoaded()) return

    const source = map.getSource("parcels") as
      | maplibregl.GeoJSONSource
      | undefined
    if (source) {
      source.setData(geojsonData)
    }
  }, [geojsonData, isLoaded, map])

  useEffect(() => {
    if (!map || !isLoaded) return

    const addLayers = () => {
      if (!map.getSource("parcels")) {
        map.addSource("parcels", { type: "geojson", data: geojsonData })
      }

      if (!map.getLayer("parcels-fill")) {
        map.addLayer({
          id: "parcels-fill",
          type: "fill",
          source: "parcels",
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": isSatellite ? 0.3 : 0.18,
          },
        })
      }

      if (!map.getLayer("parcels-line")) {
        map.addLayer({
          id: "parcels-line",
          type: "line",
          source: "parcels",
          paint: { "line-color": ["get", "color"], "line-width": 2.5 },
        })
      }
    }

    if (map.isStyleLoaded()) addLayers()
    else map.once("style.load", addLayers)
  }, [geojsonData, isLoaded, isSatellite, map])

  useEffect(() => {
    if (!map || !isLoaded) return

    const onEnter = () => {
      map.getCanvas().style.cursor = "pointer"
    }

    const onLeave = () => {
      map.getCanvas().style.cursor = ""
    }

    const onClick = (
      e: maplibregl.MapMouseEvent & {
        features?: maplibregl.MapGeoJSONFeature[]
      }
    ) => {
      const id = e.features?.[0]?.properties?.id as string
      const parcel = parcels.find((item) => item.id === id)

      if (parcel) {
        onParcelClick(parcel, getPolygonCenter(parcel.geometryCoordinates))
      }
    }

    map.on("mouseenter", "parcels-fill", onEnter)
    map.on("mouseleave", "parcels-fill", onLeave)
    map.on("click", "parcels-fill", onClick)

    return () => {
      map.off("mouseenter", "parcels-fill", onEnter)
      map.off("mouseleave", "parcels-fill", onLeave)
      map.off("click", "parcels-fill", onClick)
    }
  }, [isLoaded, map, onParcelClick, parcels])

  useEffect(() => {
    if (!map || !isLoaded || !map.isStyleLoaded()) return

    if (map.getLayer("parcels-fill")) {
      map.setPaintProperty(
        "parcels-fill",
        "fill-opacity",
        isSatellite ? 0.3 : 0.18
      )
    }
  }, [isLoaded, isSatellite, map])

  return null
}
