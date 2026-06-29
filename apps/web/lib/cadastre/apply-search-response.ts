import type { ParcelSearchResponse } from "@workspace/schemas"
import type { ParcelAddress, ParcelSearchResult } from "@workspace/web/lib/cadastre/types"
import {
  draftCentroidFromCoordinates,
  draftPolygonFromCoordinates,
  toWktPoint,
} from "@workspace/web/lib/cadastre/geometry"

export type ParcelSearchDraftUpdate = {
  polygon: string
  centroid: string
  refcat: string
  address: ParcelAddress
}

export function parcelSearchResponseToAddress(
  data: ParcelSearchResponse,
  streetOverrides?: {
    streetType?: string | null
    streetName?: string | null
    streetNumber?: string | null
  }
): ParcelAddress {
  const { address } = data.metadata

  return {
    province: address.provincia,
    municipality: address.municipio,
    ldt: address.ldt,
    streetType: streetOverrides?.streetType ?? address.streetType ?? null,
    streetName: streetOverrides?.streetName ?? address.streetName ?? null,
    streetNumber: streetOverrides?.streetNumber ?? address.streetNumber ?? null,
    postalCode: address.postalCode ?? null,
  }
}

export function applyParcelSearchResponse(
  data: ParcelSearchResponse,
  streetOverrides?: {
    streetType?: string | null
    streetName?: string | null
    streetNumber?: string | null
  }
): ParcelSearchDraftUpdate {
  const coordinates = data.geometry.polygon.coordinates
  const [lng, lat] = data.geometry.centroid.coordinates

  return {
    polygon: draftPolygonFromCoordinates(coordinates),
    centroid: toWktPoint(lng, lat),
    refcat: data.metadata.refcat,
    address: parcelSearchResponseToAddress(data, streetOverrides),
  }
}

/** Maps a client search result (already validated via API) onto draft fields. */
export function parcelSearchResultToDraft(
  result: ParcelSearchResult
): ParcelSearchDraftUpdate {
  const coordinates = result.geometryCoordinates
  const centroid = result.centroid
    ? toWktPoint(result.centroid[0], result.centroid[1])
    : draftCentroidFromCoordinates(coordinates)

  return {
    polygon: draftPolygonFromCoordinates(coordinates),
    centroid,
    refcat: result.refcat ?? "",
    address: result.address ?? {
      province: null,
      municipality: null,
      ldt: null,
      streetType: null,
      streetName: null,
      streetNumber: null,
      postalCode: null,
    },
  }
}
