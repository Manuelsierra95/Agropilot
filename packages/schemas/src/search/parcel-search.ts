import { z } from "zod"

const geoJsonPositionSchema = z.tuple([z.number(), z.number()])

export const parcelSearchPolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(geoJsonPositionSchema).min(4)),
})

export const parcelSearchPointSchema = z.object({
  type: z.literal("Point"),
  coordinates: geoJsonPositionSchema,
})

export const parcelSearchGeometrySchema = z.object({
  polygon: parcelSearchPolygonSchema,
  centroid: parcelSearchPointSchema,
})

export const parcelSearchAddressSchema = z.object({
  provincia: z.string(),
  municipio: z.string(),
  ldt: z.string(),
  streetType: z.string().nullish(),
  streetName: z.string().nullish(),
  streetNumber: z.string().nullish(),
  postalCode: z.string().nullish(),
})

export const parcelSearchResponseSchema = z.object({
  metadata: z.object({
    refcat: z.string(),
    address: parcelSearchAddressSchema,
  }),
  geometry: parcelSearchGeometrySchema,
})

export type ParcelSearchResponse = z.infer<typeof parcelSearchResponseSchema>

/** @deprecated Use ParcelSearchResponse */
export type ParcelSearchByAddressResult = ParcelSearchResponse

/** GeoJSON-style polygon rings: [lng, lat][] per ring, wrapped in a MultiPolygon-like array. */
export type ParcelPolygon = [number, number][][]
