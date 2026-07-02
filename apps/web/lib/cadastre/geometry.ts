import { getPolygonCenter } from "@workspace/web/components/maps/components/parcel-utils"

export function draftPolygonFromCoordinates(coordinates: number[][][]): string {
  return JSON.stringify(coordinates)
}

export function draftCentroidFromCoordinates(
  coordinates: number[][][]
): string {
  const [lng, lat] = getPolygonCenter(coordinates)
  return toWktPoint(lng, lat)
}

export function toWktPoint(lng: number, lat: number): string {
  return `POINT(${lng} ${lat})`
}

export function toWktPolygon(coordinates: number[][][]): string {
  const ring = coordinates[0]
  if (!ring?.length) {
    throw new Error("Polygon ring is empty")
  }

  const closedRing = closeRing(ring)
  const pairs = closedRing.map(([lng, lat]) => `${lng} ${lat}`).join(", ")

  return `POLYGON((${pairs}))`
}

function closeRing(ring: number[][]): number[][] {
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first && last && first[0] === last[0] && first[1] === last[1]) {
    return ring
  }
  return first ? [...ring, first] : ring
}

export function parseWktPolygon(wkt: string): number[][][] | null {
  const match = /^POLYGON\s*\(\((.+)\)\)$/i.exec(wkt.trim())
  if (!match?.[1]) return null

  const pairs = match[1].split(",").map((part) => {
    const [lng, lat] = part.trim().split(/\s+/).map(Number)
    return [lng, lat] as [number, number]
  })

  if (
    pairs.some(([lng, lat]) => !Number.isFinite(lng) || !Number.isFinite(lat))
  ) {
    return null
  }

  return [pairs]
}
