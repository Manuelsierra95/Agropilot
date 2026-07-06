import type {
  Parcel,
  ParcelLngLat,
} from "@workspace/web/components/maps/components/types"

export const mapCenter: [number, number] = [-4.7794, 37.8882]

export function getPolygonCenter(coordinates: number[][][]): ParcelLngLat {
  const ring = coordinates[0]

  if (!ring?.length) return [-4.7794, 37.8882]

  let lngSum = 0
  let latSum = 0

  for (const [lng, lat] of ring) {
    if (typeof lng !== "number" || typeof lat !== "number") continue
    lngSum += lng
    latSum += lat
  }

  return [lngSum / ring.length, latSum / ring.length]
}

export function toParcelFeature(parcel: Parcel) {
  return {
    type: "Feature" as const,
    geometry: {
      type: parcel.geometryType,
      coordinates: parcel.geometryCoordinates,
    },
    properties: {
      id: parcel.id,
      name: parcel.name,
      area: parcel.area,
      type: parcel.type,
      color: parcel.color,
    },
  }
}
