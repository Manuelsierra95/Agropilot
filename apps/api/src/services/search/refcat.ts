import { fetchCatastroXml, parser, REFCAT_URL } from "./client"

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

function buildRefcat(rc: {
  pc1?: string | number
  pc2?: string | number
  car?: string | number
  cc1?: string | number
  cc2?: string | number
}): string {
  return [
    formatRefcatSegment(rc.pc1, 7),
    formatRefcatSegment(rc.pc2, 7),
    formatRefcatSegment(rc.car, 4),
    formatRefcatSegment(rc.cc1, 1),
    formatRefcatSegment(rc.cc2, 1),
  ].join("")
}

function normalizeCatastro(parsed: any) {
  const consulta = parsed?.consulta_dnp
  const bi = consulta?.bico?.bi

  const rc = bi?.idbi?.rc

  const refcat = rc ? buildRefcat(rc) : null

  const dt = bi?.dt
  const loc = dt?.locs?.lous?.lourb

  return {
    refcat,
    address: {
      province: dt?.np ?? null,
      municipality: dt?.nm ?? null,
      streetType: loc?.dir?.tv ?? null,
      streetName: loc?.dir?.nv ?? null,
      streetNumber: loc?.dir?.pnp ?? null,
      postalCode: loc?.dp ?? null,
    },
  }
}

export async function getByRefcat(refcat: string) {
  const xml = await fetchCatastroXml(REFCAT_URL, mapRefCatBody(refcat))
  const parsed = parser.parse(xml)
  const result = normalizeCatastro(parsed)

  return {
    ...result,
    refcat: result.refcat ?? refcat.trim().toUpperCase(),
  }
}
