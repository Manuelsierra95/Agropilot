import { z } from 'zod'

const sourceEnum = z.enum(['manual', 'api', 'sensor', 'calculated'])

const metricSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string().min(1),
  parcelId: z.number().int().positive(),
  metricType: z.string().min(1),
  value: z.number(),
  previousValue: z.number().nullable(),
  unit: z.string().min(1),
  source: sourceEnum,
  metadata: z.record(z.any()).nullable(),
  date: z.coerce.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const metricsPostSchema = metricSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export const metricsBulkPostSchema = z.array(metricsPostSchema).min(1).max(100)

export const metricsPutSchema = metricSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export const metricsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  metricType: z.string().min(1).optional(),
  parcelId: z.coerce.number().int().positive(),
  source: sourceEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export const metricsParcelQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  metricType: z.string().min(1).optional(),
  source: sourceEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export const metricsLatestsSchema = z.object({
  metricTypes: z.array(z.string().min(1)).min(1).max(20),
})

export const metricsLatestsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})
