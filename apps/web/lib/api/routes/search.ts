import { client } from "@workspace/web/lib/api/client"
import type {
  AddressSearchQuery,
  Municipality,
  ParcelSearchResponse,
  Province,
  Street,
} from "@workspace/schemas"
import { isDemoMode } from "@workspace/web/lib/demo-mode"
import {
  getDemoAddress,
  getDemoCoordsSearch,
  getDemoMunicipalities,
  getDemoProvinces,
  getDemoRefcatSearch,
  getDemoStreets,
} from "@workspace/web/lib/mockdata"

const CATASTRO_STALE_TIME = 1000 * 60 * 60 * 24

export const searchQueryKeys = {
  all: ["search"] as const,
  provinces: () => [...searchQueryKeys.all, "provinces"] as const,
  municipalities: (province: number) =>
    [...searchQueryKeys.all, "municipalities", province] as const,
  streets: (province: number, municipality: number) =>
    [...searchQueryKeys.all, "streets", province, municipality] as const,
}

export const searchQueryOptions = {
  staleTime: CATASTRO_STALE_TIME,
}

const getProvinces = (): Promise<Province[]> => {
  if (isDemoMode()) return Promise.resolve(getDemoProvinces())
  return client.api.v1.search.provinces
    .$get()
    .then((response) => response.json())
    .then((response) => response.data)
}

const getMunicipalities = (province: number): Promise<Municipality[]> => {
  if (isDemoMode()) return Promise.resolve(getDemoMunicipalities(province))
  return client.api.v1.search.municipalities
    .$get({
      query: { province: String(province) },
    })
    .then((response) => response.json())
    .then((response) => response.data)
}

const getStreets = ({
  province,
  municipality,
}: {
  province: number
  municipality: number
}): Promise<Street[]> => {
  if (isDemoMode()) return Promise.resolve(getDemoStreets({ province, municipality }))
  return client.api.v1.search.streets
    .$get({
      query: {
        province: String(province),
        municipality: String(municipality),
      },
    })
    .then((response) => response.json())
    .then((response) => response.data)
}

async function parseParcelSearchResponse(
  response: Response,
  fallbackError: string
): Promise<ParcelSearchResponse> {
  const body = (await response.json()) as
    | { data: ParcelSearchResponse }
    | { error: string }

  if (!response.ok) {
    const message = "error" in body && body.error ? body.error : fallbackError
    throw new Error(message)
  }

  if (!("data" in body)) {
    throw new Error(fallbackError)
  }

  return body.data
}

const searchByAddress = (
  query: AddressSearchQuery
): Promise<ParcelSearchResponse> => {
  if (isDemoMode())
    return Promise.resolve({
      ...getDemoAddress(),
      ...query,
    } as unknown as ParcelSearchResponse)
  return client.api.v1.search.address
    .$get({ query })
    .then((response) =>
      parseParcelSearchResponse(
        response,
        "No se pudo localizar la parcela por dirección."
      )
    )
}

const searchByCoords = (
  lat: number,
  lng: number
): Promise<ParcelSearchResponse> => {
  if (isDemoMode())
    return Promise.resolve({
      ...getDemoCoordsSearch(),
      coords: { lat, lng },
    } as unknown as ParcelSearchResponse)
  return client.api.v1.search.coords
    .$get({ query: { lat: String(lat), lng: String(lng) } })
    .then((response) =>
      parseParcelSearchResponse(
        response,
        "No se pudo localizar la parcela por coordenadas."
      )
    )
}

const searchByRefcat = (refcat: string): Promise<ParcelSearchResponse> => {
  if (isDemoMode())
    return Promise.resolve({
      ...getDemoRefcatSearch(),
      refcat,
    } as unknown as ParcelSearchResponse)
  return client.api.v1.search.refcat[":refcat"]
    .$get({ param: { refcat } })
    .then((response) =>
      parseParcelSearchResponse(
        response,
        "No se pudo localizar la parcela por referencia catastral."
      )
    )
}

export const searchApi = {
  getProvinces,
  getMunicipalities,
  getStreets,
  searchByAddress,
  searchByCoords,
  searchByRefcat,
}

export type { ParcelSearchResponse } from "@workspace/schemas"
