import { z } from 'zod'

const geometryTypeEnum = z.enum([
  'Polygon',
  'Point',
  'LineString',
  'MultiPolygon',
  'MultiPoint',
  'MultiLineString',
])

const parcelSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string().min(1),
  name: z.string().min(1),
  area: z.number().positive().nullable(),
  type: z.string().nullable(),
  irrigationType: z.string().nullable(),
  geometryType: geometryTypeEnum,
  geometryCoordinates: z.array(z.array(z.array(z.number()))),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const parcelsPostSchema = parcelSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export const parcelsPutSchema = parcelSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export const parcelsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: z.string().optional(),
  irrigationType: z.string().optional(),
})
