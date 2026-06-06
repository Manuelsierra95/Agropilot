import {
  toCatastroAddressParams,
  type AddressSearchQuery,
  type ParcelSearchResponse,
} from "@workspace/schemas"
import { buildParcelRefcat } from "./refcat"
import { parseCatastroStructuredAddress } from "./catastro-address"
import {
  toParcelSearchResponse,
  type ParcelSearchMetadata,
} from "./parcel-search-result"

const DNPLOC_JSON_URL =
  "http://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json/Consulta_DNPLOC"

function parseDnpLocMetadata(parsed: unknown): ParcelSearchMetadata {
  const result = (parsed as { consulta_dnplocResult?: unknown })?.consulta_dnplocResult

  if (!result || typeof result !== "object") {
    throw new Error("Respuesta inválida del catastro.")
  }

  const errores = (result as { errores?: { error?: unknown } }).errores?.error
  if (errores) {
    const message =
      typeof errores === "object" && errores !== null && "des" in errores
        ? String((errores as { des?: string }).des)
        : "No se encontró la parcela para esa dirección."
    throw new Error(message)
  }

  const bi = (result as { bico?: { bi?: unknown } }).bico?.bi
  if (!bi || typeof bi !== "object") {
    throw new Error(
      "Hay varios inmuebles para esa dirección. Refina la búsqueda o usa referencia catastral."
    )
  }

  const rc = (bi as { idbi?: { rc?: { pc1?: string; pc2?: string } } }).idbi?.rc
  const refcat = rc ? buildParcelRefcat(rc) : null

  if (!refcat) {
    throw new Error("No se pudo obtener la referencia catastral de la parcela.")
  }

  const dt = (bi as { dt?: { np?: string; nm?: string } }).dt
  const ldt =
    (bi as { ldt?: string }).ldt ??
    (result as { finca?: { ldt?: string } }).finca?.ldt ??
    ""
  const structured = parseCatastroStructuredAddress(bi)

  return {
    refcat,
    provincia: dt?.np ?? "",
    municipio: dt?.nm ?? "",
    ldt,
    streetType: structured.streetType,
    streetName: structured.streetName,
    streetNumber: structured.streetNumber,
    postalCode: structured.postalCode,
  }
}

export async function searchByAddress(
  input: AddressSearchQuery
): Promise<ParcelSearchResponse> {
  const catastroParams = toCatastroAddressParams(input)
  const url = new URL(DNPLOC_JSON_URL)

  for (const [key, value] of Object.entries(catastroParams) as [
    keyof typeof catastroParams,
    string,
  ][]) {
    url.searchParams.set(key, value)
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Catastro error: ${response.status}`)
  }

  const parsed = await response.json()
  const metadata = parseDnpLocMetadata(parsed)

  return toParcelSearchResponse(
    {
      refcat: metadata.refcat,
      provincia: metadata.provincia || input.province,
      municipio: metadata.municipio || input.municipality,
      ldt: metadata.ldt,
    },
    {
      streetType: input.streetSigla,
      streetName: input.streetName,
      streetNumber: input.number,
    }
  )
}
