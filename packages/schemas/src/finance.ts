import { transactions } from "@workspace/db/schemas"
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod"
import z from "zod"

export const transactionFlowSchema = z.enum(["income", "expense"])

export const transactionCategorySchema = z.enum([
  "irrigation",
  "fertilization",
  "treatment",
  "labor",
  "machinery",
  "fuel",
  "harvest",
  "sale",
  "subsidy",
  "other",
])

export const paymentMethodSchema = z.enum([
  "transferencia",
  "tarjeta",
  "efectivo",
  "cheque",
  "otro",
])

export const transactionSelectSchema = createSelectSchema(transactions)
export const transactionInsertSchema = createInsertSchema(transactions)
export const transactionUpdateSchema = createUpdateSchema(transactions)

export const transactionCreateSchema = z.object({
  concept: z.string().trim().min(1),
  description: z.string().nullish(),
  flow: transactionFlowSchema,
  date: z.string().date(),
  category: transactionCategorySchema,
  amount: z.coerce.number().positive(),
  parcelId: z.string().nullish(),
  paymentMethod: paymentMethodSchema.nullish(),
  invoiceNumber: z.string().nullish(),
  meta: z.record(z.string(), z.unknown()).nullish(),
  campaignId: z.string().optional(),
})

export const transactionUpdateInputSchema = z
  .object({
    concept: z.string().trim().min(1).optional(),
    description: z.string().nullish(),
    flow: transactionFlowSchema.optional(),
    date: z.string().date().optional(),
    category: transactionCategorySchema.optional(),
    amount: z.coerce.number().positive().optional(),
    parcelId: z.string().nullish(),
    paymentMethod: paymentMethodSchema.nullish(),
    invoiceNumber: z.string().nullish(),
    meta: z.record(z.string(), z.unknown()).nullish(),
    campaignId: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })

export const transactionBulkCreateSchema = z.object({
  transactions: z.array(transactionCreateSchema).min(1).max(500),
})

export type TransactionFlow = z.infer<typeof transactionFlowSchema>
export type TransactionCategory = z.infer<typeof transactionCategorySchema>
export type PaymentMethod = z.infer<typeof paymentMethodSchema>

type TransactionSelectFromSchema = ReturnType<
  typeof transactionSelectSchema.parse
>

/** jsonb `meta` is `unknown` from Drizzle reads but `Json` in drizzle-zod output. */
export type TransactionSelect = Omit<TransactionSelectFromSchema, "meta"> & {
  meta: unknown | null
}
export type TransactionInsert = ReturnType<typeof transactionInsertSchema.parse>
export type TransactionUpdate = ReturnType<typeof transactionUpdateSchema.parse>

export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>
export type TransactionUpdateInput = z.infer<
  typeof transactionUpdateInputSchema
>
export type TransactionBulkCreateInput = z.infer<
  typeof transactionBulkCreateSchema
>

/** UI-only row for bulk paste preview (id is not sent to the API). */
export type TransactionBulkRow = TransactionCreateInput & { id: string }

export const parseTransactionSelect = (
  value: unknown
): TransactionSelect | null => {
  const parsed = transactionSelectSchema.safeParse(value)
  return parsed.success ? (parsed.data as unknown as TransactionSelect) : null
}
