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

export type Province = z.infer<typeof ProvinceSchema>
export type Municipality = z.infer<typeof MunicipalitySchema>
export type Street = z.infer<typeof StreetSchema>
