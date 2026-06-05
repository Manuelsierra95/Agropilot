import type { ParcelSearchResult, SearchParcelFn, SearchParcelInput } from "./types"

/** Sample parcel near Cazorla (Jaén) for UI development until catastro proxy exists. */
const MOCK_PARCEL_GEOMETRY: number[][][] = [
  [
    [-3.0012, 37.911],
    [-2.9991, 37.911],
    [-2.9991, 37.9098],
    [-3.0012, 37.9098],
    [-3.0012, 37.911],
  ],
]

const MOCK_RESULT: ParcelSearchResult = {
  refcat: "0060304WG0906S0001YO",
  geometryCoordinates: MOCK_PARCEL_GEOMETRY,
  address: {
    province: "JAÉN",
    municipality: "CAZORLA",
    streetType: "CL",
    streetName: "TORRE BAJA",
    streetNumber: "8",
    postalCode: "23470",
  },
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Temporary stub. Replace with real catastro client or API proxy without changing UI components.
 */
export const mockSearchParcel: SearchParcelFn = async (input) => {
  await delay(600)

  if (input.type === "refcat" && input.refcat.length < 14) {
    throw new Error("Introduce una referencia catastral válida (mínimo 14 caracteres).")
  }

  if (input.type === "coords") {
    const delta = 0.0008
    const { lat, lng } = input
    return {
      refcat: MOCK_RESULT.refcat,
      geometryCoordinates: [
        [
          [lng - delta, lat + delta],
          [lng + delta, lat + delta],
          [lng + delta, lat - delta],
          [lng - delta, lat - delta],
          [lng - delta, lat + delta],
        ],
      ],
      address: MOCK_RESULT.address,
    }
  }

  return { ...MOCK_RESULT }
}

export type { SearchParcelInput, ParcelSearchResult }
