import { z } from "zod"

export const transactionTypeEnum = z.enum(["ingreso", "gasto"])
export const paymentMethodEnum = z.enum([
  "transferencia",
  "tarjeta",
  "efectivo",
  "cheque",
  "otro",
])

export const financeTransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().nullable(),
  parcelId: z.string().uuid().nullable(),
  parcelName: z.string().optional(),
  type: transactionTypeEnum,
  category: z.string().min(1),
  concept: z.string().min(1),
  amount: z.number().positive(),
  paymentMethod: paymentMethodEnum.nullable(),
  invoiceNumber: z.string().nullable(),
  date: z.coerce.date(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type FinanceTransaction = z.infer<typeof financeTransactionSchema>

export type FinanceTransactionSnapshot = Pick<
  FinanceTransaction,
  "type" | "category" | "amount" | "paymentMethod" | "invoiceNumber" | "date"
> & {
  parcelName?: string
}

export type FinanceCategoryTransaction = Pick<
  FinanceTransaction,
  "id" | "concept" | "amount" | "paymentMethod" | "invoiceNumber" | "date"
>
