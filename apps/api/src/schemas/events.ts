import { z } from 'zod'

const eventsSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string().min(1),
  parcelId: z.number().int().positive().nullable(),
  title: z.string().min(1),
  description: z.string().min(1),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  category: z.string().min(1),
  color: z.string().min(1),
  tags: z.array(z.string()),
  isRead: z.number().int().min(0).max(1),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const eventsPostSchema = eventsSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export const eventsPutSchema = eventsSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export const eventsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  category: z.string().optional(),
  isRead: z.coerce.number().int().min(0).max(1).optional(),
  todayEvents: z.coerce.number().int().min(0).max(1).optional(),
})
