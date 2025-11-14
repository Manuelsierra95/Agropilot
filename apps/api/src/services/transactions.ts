import type {
  CreateTransaction,
  GetAllTransactionsOptions,
} from '@/types/transactions'
import { eq, and, desc, count, gte, lte } from 'drizzle-orm'
import { DrizzleD1Database } from 'drizzle-orm/d1'
import { serviceWrapper } from '@/handlers/serviceWrapper'
import { transactions } from '@/db/app-schema.sql'
import dayjs from 'dayjs'
import { DB_BATCH_SIZE } from '@/config/constants'

export const getTransactions = (
  db: DrizzleD1Database<any>,
  userId: string,
  options: GetAllTransactionsOptions & { parcelId?: number } = {}
) => {
  const {
    page = 1,
    limit = 10,
    type,
    category,
    parcelId,
    paymentMethod,
    startDate,
    endDate,
  } = options
  const offset = (page - 1) * limit

  return serviceWrapper({
    operation: async () => {
      const conditions = [eq(transactions.userId, userId)]

      if (parcelId !== undefined) {
        conditions.push(eq(transactions.parcelId, parcelId))
      }
      if (type !== undefined) {
        conditions.push(eq(transactions.type, type))
      }
      if (category !== undefined) {
        conditions.push(eq(transactions.category, category))
      }
      if (paymentMethod !== undefined) {
        conditions.push(eq(transactions.paymentMethod, paymentMethod))
      }
      if (startDate !== undefined) {
        conditions.push(gte(transactions.date, startDate))
      }
      if (endDate !== undefined) {
        conditions.push(lte(transactions.date, endDate))
      }

      const whereCondition = and(...conditions)

      const totalResult = await db
        .select({ count: count() })
        .from(transactions)
        .where(whereCondition)
        .all()

      const total = totalResult[0]?.count || 0

      const transactionsList = await db
        .select()
        .from(transactions)
        .where(whereCondition)
        .orderBy(desc(transactions.date))
        .limit(limit)
        .offset(offset)
        .all()

      const totalPages = Math.ceil(total / limit)
      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      return {
        data: transactionsList,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPreviousPage,
        },
      }
    },
    success: {
      message: parcelId
        ? 'Transacciones de la parcela encontradas'
        : 'Transacciones encontradas',
    },
    error: {
      message: parcelId
        ? 'Error al obtener transacciones de la parcela'
        : 'Error al obtener transacciones',
    },
    onNotFound: {
      condition: (result: any) => !result?.data || result.data.length === 0,
      message: parcelId
        ? 'No se encontraron transacciones para esta parcela'
        : 'No se encontraron transacciones',
      details: parcelId
        ? `No existen transacciones para el usuario ${userId} y la parcela ${parcelId}`
        : `No existen transacciones para el usuario ${userId}`,
      status: 404,
    },
  })
}

export const getTransactionById = (
  db: DrizzleD1Database<any>,
  id: number,
  userId: string
) =>
  serviceWrapper({
    operation: async () => {
      return await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
        .get()
    },
    success: {
      message: 'Transacción encontrada',
    },
    error: {
      message: 'Error al obtener la transacción',
    },
    onNotFound: {
      condition: (result) => !result,
      message: 'Transacción no encontrada',
      details: 'No existe una transacción con ese id',
      status: 404,
    },
  })

export const createTransaction = (
  db: DrizzleD1Database<any>,
  data: CreateTransaction
) =>
  serviceWrapper({
    operation: async () => {
      const result = await db.insert(transactions).values(data).returning()
      return result[0]
    },
    success: {
      message: 'Transacción creada',
      status: 201,
    },
    error: {
      message: 'Error al crear la transacción',
    },
    onNotFound: {
      condition: (result) => !result,
      message: 'No se pudo crear la transacción',
      details: 'No se encontró la transacción recién creada',
      status: 500,
    },
  })

export const createBulkTransactions = (
  db: DrizzleD1Database<any>,
  transactionsData: Omit<CreateTransaction, 'userId'>[],
  userId: string
) =>
  serviceWrapper({
    operation: async () => {
      const transactionsToInsert = transactionsData.map((transaction) => ({
        ...transaction,
        userId,
      }))

      // Insertar en lotes para evitar el límite de variables SQL
      const result = []
      for (let i = 0; i < transactionsToInsert.length; i += DB_BATCH_SIZE) {
        const batch = transactionsToInsert.slice(i, i + DB_BATCH_SIZE)
        const batchResult = await db
          .insert(transactions)
          .values(batch)
          .returning()
        result.push(...batchResult)
      }
      return {
        created: result.length,
        transactions: result,
      }
    },
    success: {
      message: 'Transacciones creadas exitosamente',
      status: 201,
    },
    error: {
      message: 'Error al crear las transacciones',
    },
    onNotFound: {
      condition: (result: any) => !result || result.created === 0,
      message: 'No se pudieron crear las transacciones',
      details: 'No se encontraron las transacciones recién creadas',
      status: 500,
    },
  })

export const updateTransaction = (
  db: DrizzleD1Database<any>,
  id: number,
  userId: string,
  data: Partial<CreateTransaction>
) =>
  serviceWrapper({
    operation: async () => {
      const updatedTransaction = await db
        .update(transactions)
        .set({
          ...data,
          updatedAt: dayjs().toDate(),
        })
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
        .returning()
      return updatedTransaction[0]
    },
    success: {
      message: 'Transacción actualizada',
    },
    error: {
      message: 'Error al actualizar la transacción',
    },
    onNotFound: {
      condition: (result) => !result,
      message: 'No se pudo actualizar la transacción',
      details: 'No se encontró la transacción para actualizar',
      status: 404,
    },
  })

export const deleteTransaction = (
  db: DrizzleD1Database<any>,
  id: number,
  userId: string
) =>
  serviceWrapper({
    operation: async () => {
      await db
        .delete(transactions)
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
        .returning()
      return null
    },
    success: {
      message: 'Transacción eliminada',
    },
    error: {
      message: 'Error al eliminar la transacción',
    },
  })
