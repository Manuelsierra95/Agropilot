import { z } from 'zod'

const transactionTypeEnum = z.enum(['ingreso', 'gasto'])
const paymentMethodEnum = z.enum([
  'transferencia',
  'tarjeta',
  'efectivo',
  'otro',
])

const transactionSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string().min(1),
  parcelId: z.number().int().positive(),
  type: transactionTypeEnum,
  category: z.string().min(1),
  concept: z.string().min(1),
  amount: z.number().positive(),
  paymentMethod: paymentMethodEnum.nullable(),
  invoiceNumber: z.string().nullable(),
  date: z.coerce.date(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const transactionsPostSchema = transactionSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export const transactionsBulkPostSchema = z
  .array(transactionsPostSchema)
  .min(1)
  .max(100)

export const transactionsPutSchema = transactionSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export const transactionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: transactionTypeEnum.optional(),
  category: z.string().min(1).optional(),
  parcelId: z.coerce.number().int().positive().optional(),
  paymentMethod: paymentMethodEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export const transactionsParcelQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: transactionTypeEnum.optional(),
  category: z.string().min(1).optional(),
  paymentMethod: paymentMethodEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})
