import { parcels } from "@workspace/db"
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod"
import z from "zod"

export const parcelSelectSchema = createSelectSchema(parcels)
export const parcelInsertSchema = createInsertSchema(parcels)
export const parcelUpdateSchema = createUpdateSchema(parcels)

export const parcelCreateSchema = createInsertSchema(parcels).pick({
  name: true,
  cropType: true,
  irrigationType: true,
  centroid: true,
  polygon: true,
})

export const parcelUpdateInputSchema = createUpdateSchema(parcels)
  .pick({
    name: true,
    cropType: true,
    irrigationType: true,
    centroid: true,
    polygon: true,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })

export type ParcelSelect = ReturnType<typeof parcelSelectSchema.parse>
export type ParcelInsert = ReturnType<typeof parcelInsertSchema.parse>
export type ParcelUpdate = ReturnType<typeof parcelUpdateSchema.parse>

export type ParcelCreateInput = ReturnType<typeof parcelCreateSchema.parse>
export type ParcelUpdateInput = ReturnType<typeof parcelUpdateInputSchema.parse>

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

export const parcelSearchQuerySchema = z.object({
  q: z.string().min(1, "Query parameter 'q' is required"),
})
