import { searchByCoords } from "@workspace/api/services/search/by-coords"

import { pointWkt } from "./generators"

export type ParcelSeedCoord = {
  lng: number
  lat: number
  name: string
  municipality: string
}

export type ResolvedParcelGeometry = {
  name: string
  municipality: string
  lng: number
  lat: number
  centroid: string
  polygon: string
  refcat: string | null
  province: string | null
  streetType: string | null
  streetName: string | null
  postalCode: string | null
  areaM2: number | null
}

function toWktPolygon(coordinates: [number, number][][]): string {
  const ring = coordinates[0]
  if (!ring?.length) {
    throw new Error("Polygon ring is empty")
  }

  const first = ring[0]
  const last = ring[ring.length - 1]
  const closedRing =
    first && last && first[0] === last[0] && first[1] === last[1]
      ? ring
      : first
        ? [...ring, first]
        : ring

  const pairs = closedRing.map(([lng, lat]) => `${lng} ${lat}`).join(", ")
  return `POLYGON((${pairs}))`
}

function estimateAreaFromPolygon(polygon: string): number | null {
  const match = polygon.match(/POLYGON\s*\(\(([^)]+)\)\)/i)
  if (!match?.[1]) return null

  const coords = match[1]
    .split(",")
    .map((pair) => pair.trim().split(/\s+/).map(Number.parseFloat))
    .filter((pair) => pair.length === 2 && pair.every((n) => Number.isFinite(n)))

  if (coords.length < 3) return null

  let area = 0
  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i]
    const p2 = coords[(i + 1) % coords.length]
    if (!p1 || !p2 || p1.length < 2 || p2.length < 2) continue
    const x1 = p1[0] ?? 0
    const y1 = p1[1] ?? 0
    const x2 = p2[0] ?? 0
    const y2 = p2[1] ?? 0
    area += x1 * y2 - x2 * y1
  }

  const degArea = Math.abs(area) / 2
  const metersPerDegLat = 111_320
  const firstLat = coords[0]?.[1] ?? 38
  const metersPerDegLng = 111_320 * Math.cos((firstLat * Math.PI) / 180)
  return Math.round(degArea * metersPerDegLat * metersPerDegLng)
}

export async function resolveParcelGeometry(
  coord: ParcelSeedCoord,
  index: number
): Promise<ResolvedParcelGeometry> {
  try {
    const result = await searchByCoords({ lat: coord.lat, lng: coord.lng })
    const [lng, lat] = result.geometry.centroid.coordinates
    const polygon = toWktPolygon(result.geometry.polygon.coordinates)
    const address = result.metadata.address

    return {
      name: coord.name,
      municipality: address.municipio || coord.municipality,
      lng,
      lat,
      centroid: pointWkt(lng, lat),
      polygon,
      refcat: result.metadata.refcat,
      province: address.provincia || "Jaén",
      streetType: address.streetType ?? "Camino",
      streetName: address.streetName ?? `Vereda ${coord.name}`,
      postalCode: address.postalCode ?? "23400",
      areaM2: estimateAreaFromPolygon(polygon),
    }
  } catch {
    const areaHa = 6.3 + index * 2.1
    const polygon = `POLYGON((${coord.lng} ${coord.lat}, ${coord.lng + 0.002} ${coord.lat}, ${coord.lng + 0.002} ${coord.lat + 0.002}, ${coord.lng} ${coord.lat + 0.002}, ${coord.lng} ${coord.lat}))`

    return {
      name: coord.name,
      municipality: coord.municipality,
      lng: coord.lng,
      lat: coord.lat,
      centroid: pointWkt(coord.lng, coord.lat),
      polygon,
      refcat: `12345${String(index + 1).padStart(8, "0")}AB`,
      province: "Jaén",
      streetType: "Camino",
      streetName: `Vereda ${coord.name}`,
      postalCode: "23400",
      areaM2: Math.round(areaHa * 10_000),
    }
  }
}
