import { COORDS_URL, parser } from "./client"
import { formatRefcatSegment, getByRefcat } from "./refcat"

function parseRefcat(
  pc1: string | number | undefined,
  pc2: string | number | undefined
): string | null {
  if (pc1 == null || pc2 == null) return null
  return (
    formatRefcatSegment(pc1, 7) + formatRefcatSegment(pc2, 7)
  ).toUpperCase()
}

export async function searchByCoords({
  lat,
  lng,
}: {
  lat: number
  lng: number
}) {
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
  const refcat = parseRefcat(coord?.pc?.pc1, coord?.pc?.pc2)

  if (!refcat) {
    throw new Error("No se encontró ninguna parcela para esas coordenadas")
  }

  return getByRefcat(refcat)
}
