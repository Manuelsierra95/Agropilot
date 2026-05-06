import { z } from "zod"

export const transactionTypeEnum = z.enum(["ingreso", "gasto"])
export const paymentMethodEnum = z.enum([
  "transferencia",
  "tarjeta",
  "efectivo",
  "cheque",
  "otro",
])

export const transactionSchema = z.object({
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

export type Transaction = z.infer<typeof transactionSchema>
