import { z } from "zod"

export const ProvinceSchema = z.object({
  Codigo: z.number(),
  Denominacion: z.string(),
})

export const MunicipalitySchema = z.object({
  Codigo: z.number(),
  Denominacion: z.string(),
})

export const StreetSchema = z.object({
  Codigo: z.number(),
  Sigla: z.string(),
  TipoVia: z.string(),
  Denominacion: z.string(),
  CodigoMunicipioAgregado: z.number().nullable(),
  DenominacionMunicipioAgregado: z.string(),
  DenominacionCompleta: z.string(),
})

export const municipalitiesQuerySchema = z.object({
  province: z.coerce.number().min(1),
})

export const streetsQuerySchema = z.object({
  province: z.coerce.number().min(1),
  municipality: z.coerce.number().min(1),
})

export const coordsQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
})

export const refcatParamsSchema = z.object({
  refcat: z.string().min(1),
})

const addressTextField = z
  .string()
  .trim()
  .min(1)
  .transform((value) => value.toUpperCase())

const addressNumberField = z.string().trim().min(1)

export const addressSearchQuerySchema = z.object({
  province: addressTextField,
  municipality: addressTextField,
  streetSigla: addressTextField,
  streetName: addressTextField,
  number: addressNumberField,
})

export type AddressSearchQuery = z.infer<typeof addressSearchQuerySchema>

export type CatastroAddressParams = {
  Provincia: string
  Municipio: string
  Sigla: string
  Calle: string
  Numero: string
}

/** Maps API query fields to Catastro DNPLOC params (trim + uppercase for text fields). */
export function toCatastroAddressParams(
  query: z.input<typeof addressSearchQuerySchema>
): CatastroAddressParams {
  const normalized = addressSearchQuerySchema.parse(query)

  return {
    Provincia: normalized.province,
    Municipio: normalized.municipality,
    Sigla: normalized.streetSigla,
    Calle: normalized.streetName,
    Numero: normalized.number,
  }
}

const geoJsonPositionSchema = z.tuple([z.number(), z.number()])

export const parcelSearchPolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(geoJsonPositionSchema).min(4)),
})

export const parcelSearchPointSchema = z.object({
  type: z.literal("Point"),
  coordinates: geoJsonPositionSchema,
})

/** Polygon + centroid (EPSG:4326, [lng, lat]) aligned with DB geometry columns. */
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

export type Province = z.infer<typeof ProvinceSchema>
export type Municipality = z.infer<typeof MunicipalitySchema>
export type Street = z.infer<typeof StreetSchema>
