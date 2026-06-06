import { parseCadastreLdt, type ParcelSearchResponse } from "@workspace/schemas"
import { fetchPolygon, getPolygonCentroid } from "./geometry"
import { lookupPostalCodeByCoords } from "./reverse-geocode"

export type ParcelSearchMetadata = {
  refcat: string
  provincia: string
  municipio: string
  ldt: string
  streetType?: string
  streetName?: string
  streetNumber?: string
  postalCode?: string
}

export type ParcelSearchAddressOverrides = {
  streetType?: string | null
  streetName?: string | null
  streetNumber?: string | null
  postalCode?: string | null
}

function buildAddressFromMetadata(
  metadata: ParcelSearchMetadata,
  overrides?: ParcelSearchAddressOverrides
): ParcelSearchResponse["metadata"]["address"] {
  const parsed = parseCadastreLdt(metadata.ldt)

  return {
    provincia: metadata.provincia || parsed.province || "",
    municipio: metadata.municipio || parsed.municipality || "",
    ldt: metadata.ldt,
    streetType:
      overrides?.streetType ??
      metadata.streetType ??
      parsed.streetType ??
      null,
    streetName:
      overrides?.streetName ??
      metadata.streetName ??
      parsed.streetName ??
      null,
    streetNumber:
      overrides?.streetNumber ??
      metadata.streetNumber ??
      parsed.streetNumber ??
      null,
    postalCode:
      overrides?.postalCode ??
      metadata.postalCode ??
      parsed.postalCode ??
      null,
  }
}

export async function toParcelSearchResponse(
  metadata: ParcelSearchMetadata,
  addressOverrides?: ParcelSearchAddressOverrides
): Promise<ParcelSearchResponse> {
  const coordinates = await fetchPolygon(metadata.refcat)
  const centroid = getPolygonCentroid(coordinates)
  const address = buildAddressFromMetadata(metadata, addressOverrides)

  if (!address.postalCode) {
    const [lng, lat] = centroid
    const postalCode = await lookupPostalCodeByCoords(lat, lng)
    if (postalCode) {
      address.postalCode = postalCode
    }
  }

  return {
    metadata: {
      refcat: metadata.refcat,
      address,
    },
    geometry: {
      polygon: {
        type: "Polygon",
        coordinates,
      },
      centroid: {
        type: "Point",
        coordinates: centroid,
      },
    },
  }
}
