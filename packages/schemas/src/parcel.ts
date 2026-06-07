import { parcels } from "@workspace/db/schemas"
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod"
import z from "zod"

export const parcelSelectSchema = createSelectSchema(parcels)
export const parcelInsertSchema = createInsertSchema(parcels)
export const parcelUpdateSchema = createUpdateSchema(parcels)

const parcelLocationFieldShape = {
  refcat: z.string().nullish(),
  province: z.string().nullish(),
  municipality: z.string().nullish(),
  streetType: z.string().nullish(),
  streetName: z.string().nullish(),
  streetNumber: z.string().nullish(),
  postalCode: z.string().nullish(),
}

export const parcelCreateSchema = z.object({
  name: z.string().trim().min(1),
  cropType: z.string().min(1),
  irrigationType: z.enum(["dryland", "irrigated"]).nullish(),
  areaHa: z.coerce.number().positive().optional(),
  areaM2: z.coerce.number().int().positive().optional(),
  centroid: z.string().nullish(),
  polygon: z.string().nullish(),
  ...parcelLocationFieldShape,
})

export const parcelUpdateInputSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    cropType: z.string().min(1).optional(),
    irrigationType: z.enum(["dryland", "irrigated"]).nullish(),
    areaHa: z.coerce.number().positive().optional(),
    areaM2: z.coerce.number().int().positive().optional(),
    centroid: z.string().nullish(),
    polygon: z.string().nullish(),
    ...parcelLocationFieldShape,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })

export type ParcelSelect = ReturnType<typeof parcelSelectSchema.parse>
export type ParcelInsert = ReturnType<typeof parcelInsertSchema.parse>
export type ParcelUpdate = ReturnType<typeof parcelUpdateSchema.parse>

export type ParcelCreateInput = z.infer<typeof parcelCreateSchema>
export type ParcelUpdateInput = z.infer<typeof parcelUpdateInputSchema>

export const parseParcelSelect = (value: unknown): ParcelSelect | null => {
  const parsed = parcelSelectSchema.safeParse(value)
  return parsed.success ? (parsed.data as unknown as ParcelSelect) : null
}

export const parseParcelInsert = (value: unknown): ParcelInsert | null => {
  const parsed = parcelInsertSchema.safeParse(value)
  return parsed.success ? (parsed.data as unknown as ParcelInsert) : null
}

export const parseParcelUpdate = (value: unknown): ParcelUpdate | null => {
  const parsed = parcelUpdateSchema.safeParse(value)
  return parsed.success ? (parsed.data as unknown as ParcelUpdate) : null
}
