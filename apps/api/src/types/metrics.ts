import { metrics } from '@/db/app-schema.sql'

export type Metrics = typeof metrics.$inferSelect
export type CreateMetric = Omit<Metrics, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateMetric = Partial<
  Omit<Metrics, 'id' | 'createdAt' | 'updatedAt'>
>

export interface GetAllMetricsOptions {
  page?: number
  limit?: number
  metricType?: string
  parcelId?: number
  source?: string
  startDate?: Date
  endDate?: Date
}
