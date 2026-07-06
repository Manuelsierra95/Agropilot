import { sql } from "@workspace/db"

export function parseWktPoint(
  wkt: string | null | undefined
): { lat: number; lng: number } | null {
  if (!wkt) return null

  const match = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i)
  if (!match?.[1] || !match[2]) return null

  return {
    lng: Number(match[1]),
    lat: Number(match[2]),
  }
}

export function parseWktPolygon(
  wkt: string | null | undefined
): number[][][] | null {
  if (!wkt) return null

  const match = wkt.match(/POLYGON\s*\(\(([^)]+)\)\)/i)
  if (!match?.[1]) return null

  const ring = match[1].split(",").map((pair) => {
    const parts = pair.trim().split(/\s+/).map(Number)
    const lng = parts[0] ?? 0
    const lat = parts[1] ?? 0
    return [lng, lat]
  })

  return ring.length > 0 ? [ring] : null
}

export function parseGeoJsonPolygon(
  geoJson: string | null | undefined
): number[][][] | null {
  if (!geoJson) return null

  try {
    const parsed = JSON.parse(geoJson) as {
      type?: string
      coordinates?: unknown
    }

    if (parsed.type !== "Polygon" || !Array.isArray(parsed.coordinates)) {
      return null
    }

    const rings = parsed.coordinates as number[][][]
    if (!rings.length || !Array.isArray(rings[0]) || rings[0].length === 0) {
      return null
    }

    return rings
  } catch {
    return null
  }
}

/** Parses polygon geometry stored as GeoJSON (PostGIS) or WKT text. */
export function parsePolygonGeometry(
  value: string | null | undefined
): number[][][] | null {
  if (!value?.trim()) return null

  const trimmed = value.trim()
  if (trimmed.startsWith("{")) {
    return parseGeoJsonPolygon(trimmed)
  }

  if (trimmed.toUpperCase().startsWith("POLYGON")) {
    return parseWktPolygon(trimmed)
  }

  return null
}

export const geoService = {
  centroid: (geom: any) => {
    return sql`ST_Centroid(${geom})`
  },

  lat: (geom: any) => {
    return sql<number>`ST_Y(${geom})`
  },

  lng: (geom: any) => {
    return sql<number>`ST_X(${geom})`
  },

  latLng: (geom: any) => {
    return {
      lat: sql<number>`ST_Y(ST_Centroid(${geom}))`,
      lng: sql<number>`ST_X(ST_Centroid(${geom}))`,
    }
  },

  areaM2: (geom: any) => {
    return sql<number>`
      ROUND(ST_Area(${geom}::geography)::numeric)
    `
  },
}
