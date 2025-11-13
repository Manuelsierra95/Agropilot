import { transactions } from '@/db/app-schema.sql'

export type Transaction = typeof transactions.$inferSelect
export type CreateTransaction = Omit<
  Transaction,
  'id' | 'createdAt' | 'updatedAt'
>
export type UpdateTransaction = Partial<
  Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
>

export interface GetAllTransactionsOptions {
  page?: number
  limit?: number
  type?: 'ingreso' | 'gasto'
  category?: string
  parcelId?: number
  paymentMethod?: string
  startDate?: Date
  endDate?: Date
}
