import { fetchCatastroXml, parser, REFCAT_URL } from "@workspace/api/services/search/client"
import { parseCatastroStructuredAddress } from "@workspace/api/services/search/catastro-address"
import type { ParcelSearchMetadata } from "@workspace/api/services/search/parcel-search-result"
import { toParcelSearchResponse } from "@workspace/api/services/search/parcel-search-result"
import type { ParcelSearchResponse } from "@workspace/schemas"

function mapRefCatBody(refcat: string) {
  return {
    CodigoProvincia: "",
    CodigoMunicipio: "",
    CodigoMunicipioINE: "",
    RC: refcat,
  }
}

export function formatRefcatSegment(
  value: string | number | undefined,
  length: number
): string {
  const str = String(value ?? "")
  return str.length >= length ? str : str.padStart(length, "0")
}

export function buildParcelRefcat(rc: {
  pc1?: string | number
  pc2?: string | number
}): string {
  return (
    formatRefcatSegment(rc.pc1, 7) + formatRefcatSegment(rc.pc2, 7)
  ).toUpperCase()
}

export function normalizeRefcatInput(refcat: string): string {
  return refcat.trim().toUpperCase().replace(/\s+/g, "")
}

/** Parcel-level refcat (14 chars) used for polygon WFS queries. */
export function toParcelRefcat(refcat: string): string {
  const normalized = normalizeRefcatInput(refcat)
  return normalized.length >= 14 ? normalized.slice(0, 14) : normalized
}

function parseCatastroMetadata(
  parsed: unknown,
  inputRefcat: string
): ParcelSearchMetadata {
  const consulta = (parsed as { consulta_dnp?: unknown })?.consulta_dnp
  const bi = (consulta as { bico?: { bi?: unknown } })?.bico?.bi

  if (!bi || typeof bi !== "object") {
    throw new Error("No se encontró la parcela para esa referencia catastral.")
  }

  const rc = (bi as { idbi?: { rc?: { pc1?: string; pc2?: string } } }).idbi?.rc
  const parcelRefcat = rc ? buildParcelRefcat(rc) : toParcelRefcat(inputRefcat)

  const dt = (bi as { dt?: { np?: string; nm?: string } }).dt
  const ldt = (bi as { ldt?: string }).ldt ?? ""
  const structured = parseCatastroStructuredAddress(bi)

  return {
    refcat: parcelRefcat,
    provincia: dt?.np ?? "",
    municipio: dt?.nm ?? "",
    ldt,
    streetType: structured.streetType,
    streetName: structured.streetName,
    streetNumber: structured.streetNumber,
    postalCode: structured.postalCode,
  }
}

export async function getParcelMetadataByRefcat(
  refcat: string
): Promise<ParcelSearchMetadata> {
  const normalized = normalizeRefcatInput(refcat)
  const xml = await fetchCatastroXml(REFCAT_URL, mapRefCatBody(normalized))
  const parsed = parser.parse(xml)
  return parseCatastroMetadata(parsed, normalized)
}

export async function searchByRefcat(
  refcat: string
): Promise<ParcelSearchResponse> {
  const metadata = await getParcelMetadataByRefcat(refcat)
  return toParcelSearchResponse(metadata)
}
