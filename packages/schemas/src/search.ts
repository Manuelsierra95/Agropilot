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

/** GeoJSON-style polygon rings: [lng, lat][] per ring, wrapped in a MultiPolygon-like array. */
export type ParcelPolygon = [number, number][][]

export type Province = z.infer<typeof ProvinceSchema>
export type Municipality = z.infer<typeof MunicipalitySchema>
export type Street = z.infer<typeof StreetSchema>
