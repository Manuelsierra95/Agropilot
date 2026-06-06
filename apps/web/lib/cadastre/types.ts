export type ParcelAddress = {
  province?: string | null
  municipality?: string | null
  /** Full cadastre location description (ldt). */
  ldt?: string | null
  streetType?: string | null
  streetName?: string | null
  streetNumber?: string | null
  postalCode?: string | null
}

export type ParcelSearchResult = {
  refcat?: string
  geometryCoordinates: number[][][]
  /** Centroid [lng, lat] from API when available. */
  centroid?: [number, number]
  address?: ParcelAddress | null
}

export type AddressQuery = {
  provincia: string
  municipio: string
  tipoVia: string
  nombreVia: string
  numero: string
}

export type SearchParcelInput =
  | { type: "coords"; lat: number; lng: number }
  | { type: "refcat"; refcat: string }
  | ({ type: "address" } & AddressQuery & { tipoViaSigla: string })

export type SearchParcelFn = (
  input: SearchParcelInput
) => Promise<ParcelSearchResult>
