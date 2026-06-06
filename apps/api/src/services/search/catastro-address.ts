type CatastroDir = {
  tv?: string
  nv?: string
  pnp?: string
}

function asString(value: unknown): string | undefined {
  if (value == null) return undefined
  const normalized = String(value).trim()
  return normalized || undefined
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") return undefined
  return value as Record<string, unknown>
}

function readLorusFromLocs(locs: unknown): Record<string, unknown> | undefined {
  const locsRecord = readRecord(locs)
  if (!locsRecord) return undefined

  const lors = readRecord(locsRecord.lors)
  if (lors?.lorus) return readRecord(lors.lorus)

  return undefined
}

function readLourbFromLocs(locs: unknown): Record<string, unknown> | undefined {
  const locsRecord = readRecord(locs)
  if (!locsRecord) return undefined

  const lous = readRecord(locsRecord.lous)
  if (lous?.lourb) return readRecord(lous.lourb)

  const lors = readRecord(locsRecord.lors)
  if (lors?.lourb) return readRecord(lors.lourb)

  return undefined
}

export type CatastroStructuredAddress = {
  streetType?: string
  streetName?: string
  streetNumber?: string
  postalCode?: string
}

/** Reads address fields from catastro `bi.dt` XML (parsed as JSON). */
export function parseCatastroStructuredAddress(
  bi: unknown
): CatastroStructuredAddress {
  const dt = readRecord(readRecord(bi)?.dt)
  if (!dt) return {}

  const lourb = readLourbFromLocs(dt.locs)
  if (lourb) {
    const dir = readRecord(lourb.dir) as CatastroDir | undefined

    return {
      streetType: asString(dir?.tv),
      streetName: asString(dir?.nv),
      streetNumber: asString(dir?.pnp),
      postalCode: asString(lourb.dp),
    }
  }

  const lorus = readLorusFromLocs(dt.locs)
  if (!lorus) return {}

  const cpp = readRecord(lorus.cpp)
  const polygon = asString(cpp?.cpo)
  const parcel = asString(cpp?.cpa)
  const locality = asString(lorus.npa)

  const streetName =
    polygon && parcel && locality
      ? `Polígono ${polygon} Parcela ${parcel} ${locality}`
      : locality

  return {
    streetName,
  }
}
