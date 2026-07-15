import { parser, POLYGON_WFS_URL } from "@workspace/api/services/search/client"

function parsePolygon(json: any): [number, number][][] {
  const posListRaw =
    json?.FeatureCollection?.member?.["cp:CadastralParcel"]?.["cp:geometry"]?.[
      "gml:MultiSurface"
    ]?.["gml:surfaceMember"]?.["gml:Surface"]?.["gml:patches"]?.[
      "gml:PolygonPatch"
    ]?.["gml:exterior"]?.["gml:LinearRing"]?.["gml:posList"]?.["#text"]

  if (!posListRaw) {
    throw new Error("No se encontró geometría para esa referencia catastral")
  }

  const values = String(posListRaw).trim().split(/\s+/).map(Number)

  const polygon: [number, number][] = []
  for (let i = 0; i < values.length - 1; i += 2) {
    const lat = values[i + 1]
    const lng = values[i]
    if (lat === undefined || lng === undefined) continue
    polygon.push([lng, lat])
  }

  return [polygon]
}

export async function fetchPolygon(
  refcat: string
): Promise<[number, number][][]> {
  const url = new URL(POLYGON_WFS_URL)
  url.searchParams.set("service", "wfs")
  url.searchParams.set("version", "2")
  url.searchParams.set("request", "getfeature")
  url.searchParams.set("STOREDQUERIE_ID", "GetParcel")
  url.searchParams.set("refcat", refcat)
  url.searchParams.set("srsname", "EPSG:4326")

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("No se pudo obtener la geometria de la parcela")
  }

  const json = parser.parse(await response.text())
  return parsePolygon(json)
}

/** Centroid of the exterior ring (mean of vertices), EPSG:4326 [lng, lat]. */
export function getPolygonCentroid(
  coordinates: [number, number][][]
): [number, number] {
  const ring = coordinates[0]

  if (!ring?.length) {
    throw new Error("Polygon ring is empty")
  }

  let lngSum = 0
  let latSum = 0

  for (const [lng, lat] of ring) {
    lngSum += lng
    latSum += lat
  }

  return [lngSum / ring.length, latSum / ring.length]
}
