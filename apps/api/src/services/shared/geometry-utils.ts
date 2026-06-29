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

import { sql } from "@workspace/db"

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
