import { parcels } from "@workspace/db"
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod"

export const parcelSelectSchema = createSelectSchema(parcels)
export const parcelInsertSchema = createInsertSchema(parcels)
export const parcelUpdateSchema = createUpdateSchema(parcels)

export type ParcelSelect = typeof parcelSelectSchema.type
export type ParcelInsert = typeof parcelInsertSchema.type
export type ParcelUpdate = typeof parcelUpdateSchema.type

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
