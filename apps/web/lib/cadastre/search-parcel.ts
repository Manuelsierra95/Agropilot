import { searchApi } from "@/lib/api/routes/search"
import { applyParcelSearchResponse } from "./apply-search-response"
import type { ParcelSearchResult, SearchParcelFn, SearchParcelInput } from "./types"

function toParcelSearchResult(
  data: Awaited<ReturnType<typeof searchApi.searchByAddress>>,
  input?: Extract<SearchParcelInput, { type: "address" }>
): ParcelSearchResult {
  const draft = applyParcelSearchResponse(data, {
    streetType: input?.tipoViaSigla ?? null,
    streetName: input?.nombreVia ?? null,
    streetNumber: input?.numero ?? null,
  })

  return {
    refcat: draft.refcat,
    geometryCoordinates: data.geometry.polygon.coordinates,
    centroid: data.geometry.centroid.coordinates,
    address: draft.address,
  }
}

export const searchParcel: SearchParcelFn = async (input) => {
  switch (input.type) {
    case "address": {
      const data = await searchApi.searchByAddress({
        province: input.provincia,
        municipality: input.municipio,
        streetSigla: input.tipoViaSigla,
        streetName: input.nombreVia,
        number: input.numero,
      })
      return toParcelSearchResult(data, input)
    }
    case "coords": {
      const data = await searchApi.searchByCoords(input.lat, input.lng)
      return toParcelSearchResult(data)
    }
    case "refcat": {
      const normalized = input.refcat.replace(/\s+/g, "")
      if (normalized.length < 14) {
        throw new Error(
          "Introduce una referencia catastral válida (mínimo 14 caracteres)."
        )
      }
      const data = await searchApi.searchByRefcat(normalized)
      return toParcelSearchResult(data)
    }
  }
}

export type { SearchParcelInput, ParcelSearchResult }
