export type ParsedCadastreLdt = {
  province?: string
  municipality?: string
  streetType?: string
  streetName?: string
  streetNumber?: string
  postalCode?: string
}

const PROVINCE_SUFFIX = /\s+\(([^)]+)\)\s*$/

const RURAL_PATTERN =
  /^Pol[ií]gono\s+(\d+)\s+Parcela\s+(\d+)\s+(.+?)\.\s*(.+)$/i

const URBAN_WITH_POSTAL =
  /^([A-ZÁÉÍÓÚÜÑ]{1,5})\s+(.+?)\s+(\d{1,4}[A-Z]?|s\/n)\s+(\d{5})\s+(.+)$/i

const URBAN_WITHOUT_POSTAL =
  /^([A-ZÁÉÍÓÚÜÑ]{1,5})\s+(.+?)\s+(\d{1,4}[A-Z]?|s\/n)\s+(.+)$/i

function extractPostalAndMunicipality(rest: string): {
  rest: string
  postalCode?: string
  municipality?: string
} {
  const match = rest.match(/\s+(\d{5})\s+(.+)$/)
  if (!match || match.index == null) {
    return { rest }
  }

  return {
    rest: rest.slice(0, match.index).trim(),
    postalCode: match[1]?.trim(),
    municipality: match[2]?.trim(),
  }
}

function normalizeStreetNumber(value: string): string {
  return value.toLowerCase() === "s/n" ? "s/n" : value
}

function extractProvinceSuffix(ldt: string): {
  rest: string
  province?: string
} {
  const trimmed = ldt.trim()
  const match = trimmed.match(PROVINCE_SUFFIX)
  if (!match || match.index == null) {
    return { rest: trimmed }
  }

  return {
    rest: trimmed.slice(0, match.index).trim(),
    province: match[1]?.trim(),
  }
}

/** Parses catastro `ldt` location strings into structured address fields. */
export function parseCadastreLdt(ldt: string): ParsedCadastreLdt {
  const trimmed = ldt.trim()
  if (!trimmed) return {}

  const { rest, province } = extractProvinceSuffix(trimmed)
  const {
    rest: body,
    postalCode: trailingPostalCode,
    municipality: trailingMunicipality,
  } = extractPostalAndMunicipality(rest)

  const rural = body.match(RURAL_PATTERN)
  if (rural) {
    const [, polygon, parcel, locality, municipality] = rural
    return {
      province,
      municipality: municipality?.trim() || trailingMunicipality,
      postalCode: trailingPostalCode,
      streetName: `Polígono ${polygon} Parcela ${parcel} ${locality?.trim()}`,
    }
  }

  const urbanPostal = body.match(URBAN_WITH_POSTAL)
  if (urbanPostal) {
    const [, streetType, streetName, streetNumber, postalCode, municipality] =
      urbanPostal
    return {
      province,
      municipality: municipality?.trim() || trailingMunicipality,
      streetType: streetType?.trim(),
      streetName: streetName?.trim(),
      streetNumber: normalizeStreetNumber(streetNumber?.trim() ?? ""),
      postalCode: postalCode?.trim() || trailingPostalCode,
    }
  }

  const urban = body.match(URBAN_WITHOUT_POSTAL)
  if (urban) {
    const [, streetType, streetName, streetNumber, municipality] = urban
    return {
      province,
      municipality: municipality?.trim() || trailingMunicipality,
      streetType: streetType?.trim(),
      streetName: streetName?.trim(),
      streetNumber: normalizeStreetNumber(streetNumber?.trim() ?? ""),
      postalCode: trailingPostalCode,
    }
  }

  return {
    ...(province ? { province } : {}),
    ...(trailingMunicipality ? { municipality: trailingMunicipality } : {}),
    ...(trailingPostalCode ? { postalCode: trailingPostalCode } : {}),
  }
}
