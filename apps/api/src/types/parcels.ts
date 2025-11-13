import { parcels } from '@/db/app-schema.sql'

export type Parcels = typeof parcels.$inferSelect
export type CreateParcel = Omit<Parcels, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateParcel = Partial<
  Omit<Parcels, 'id' | 'createdAt' | 'updatedAt'>
>

export interface GetAllParcelsOptions {
  page?: number
  limit?: number
  type?: string
  irrigationType?: string
}
