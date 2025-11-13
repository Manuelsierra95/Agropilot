import { events } from '@/db/app-schema.sql'

export type Events = typeof events.$inferSelect
export type CreateEvents = Omit<Events, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateEvents = Partial<
  Omit<Events, 'id' | 'createdAt' | 'updatedAt'>
>

export interface GetAllEventsOptions {
  page?: number
  limit?: number
  category?: string
  isRead?: number
  todayEvents?: number
}
