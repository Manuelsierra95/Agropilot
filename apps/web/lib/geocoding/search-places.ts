import { z } from "zod"

import type { PlaceSuggestion, SearchPlacesOptions } from "@workspace/web/lib/geocoding/types"

const PHOTON_API = "https://photon.komoot.io/api/"

/** Bounding box for Spain: minLon, minLat, maxLon, maxLat */
const SPAIN_BBOX = "-9.5,36,-1.5,44"

const photonFeatureSchema = z.object({
  type: z.literal("Feature"),
  geometry: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  properties: z.object({
    name: z.string().optional(),
    country: z.string().optional(),
    countrycode: z.string().optional(),
    state: z.string().optional(),
    county: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    street: z.string().optional(),
    housenumber: z.string().optional(),
    postcode: z.string().optional(),
    osm_value: z.string().optional(),
    osm_key: z.string().optional(),
  }),
})

const photonResponseSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(photonFeatureSchema),
})

function formatPlaceLabel(
  properties: z.infer<typeof photonFeatureSchema>["properties"]
): string {
  const parts: string[] = []

  if (properties.name) {
    parts.push(properties.name)
  } else if (properties.street) {
    const street = properties.housenumber
      ? `${properties.street} ${properties.housenumber}`
      : properties.street
    parts.push(street)
  }

  if (properties.district && properties.district !== properties.name) {
    parts.push(properties.district)
  }

  if (properties.city && properties.city !== properties.name) {
    parts.push(properties.city)
  }

  if (
    properties.county &&
    properties.county !== properties.name &&
    properties.county !== properties.city
  ) {
    parts.push(properties.county)
  }

  if (properties.state) {
    parts.push(properties.state)
  }

  if (properties.country) {
    parts.push(properties.country)
  }

  return parts.length > 0 ? parts.join(", ") : "Ubicación desconocida"
}

function featureToSuggestion(
  feature: z.infer<typeof photonFeatureSchema>,
  index: number
): PlaceSuggestion {
  const [lng, lat] = feature.geometry.coordinates
  const { properties } = feature

  return {
    id: `${lng},${lat},${properties.osm_key ?? "place"}-${properties.osm_value ?? index}-${index}`,
    label: formatPlaceLabel(properties),
    lat,
    lng,
    type: properties.osm_value,
  }
}

export function zoomForPlaceType(type?: string): number {
  switch (type) {
    case "country":
      return 6
    case "state":
      return 8
    case "county":
    case "province":
      return 9
    case "city":
      return 11
    case "town":
    case "municipality":
      return 12
    case "suburb":
    case "neighbourhood":
    case "quarter":
      return 13
    case "street":
    case "house":
    case "building":
      return 14
    default:
      return 12
  }
}

export async function searchPlaces(
  query: string,
  options: SearchPlacesOptions = {}
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const { limit = 5, signal } = options

  const params = new URLSearchParams({
    q: trimmed,
    limit: String(limit),
    bbox: SPAIN_BBOX,
  })

  const response = await fetch(`${PHOTON_API}?${params.toString()}`, {
    signal,
    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    throw new Error("No se pudieron obtener sugerencias de ubicación")
  }

  const json: unknown = await response.json()
  const parsed = photonResponseSchema.safeParse(json)

  if (!parsed.success) {
    throw new Error("Respuesta de geocodificación no válida")
  }

  return parsed.data.features.map(featureToSuggestion)
}
