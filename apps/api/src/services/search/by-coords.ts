import type { ParcelSearchResponse } from "@workspace/schemas"
import { COORDS_URL, parser } from "@workspace/api/services/search/client"
import {
  buildParcelRefcat,
  formatRefcatSegment,
  getParcelMetadataByRefcat,
} from "@workspace/api/services/search/refcat"
import { toParcelSearchResponse } from "@workspace/api/services/search/parcel-search-result"

function parseRefcatFromCoords(
  pc1: string | number | undefined,
  pc2: string | number | undefined
): string | null {
  if (pc1 == null || pc2 == null) return null
  return buildParcelRefcat({ pc1, pc2 })
}

export async function searchByCoords({
  lat,
  lng,
}: {
  lat: number
  lng: number
}): Promise<ParcelSearchResponse> {
  const params = new URLSearchParams({
    SRS: "EPSG:4326",
    Coordenada_X: String(lng),
    Coordenada_Y: String(lat),
  })

  const response = await fetch(`${COORDS_URL}?${params}`)

  if (!response.ok) {
    throw new Error(`Catastro error: ${response.status}`)
  }

  const xml = await response.text()
  const parsed = parser.parse(xml)
  const coord = parsed?.consulta_coordenadas?.coordenadas?.coord
  const parcelRefcat = parseRefcatFromCoords(coord?.pc?.pc1, coord?.pc?.pc2)

  if (!parcelRefcat) {
    throw new Error("No se encontró ninguna parcela para esas coordenadas")
  }

  const metadata = await getParcelMetadataByRefcat(parcelRefcat)
  return toParcelSearchResponse(metadata)
}
