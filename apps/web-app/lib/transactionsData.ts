import { apiClient } from '@/lib/apiClient'
import { TransactionsResponse, Transaction } from '@/store/useTransactionStore'

type TransactionQueryParams = {
  page?: number
  limit?: number
  type?: 'ingreso' | 'gasto'
  category?: string
  paymentMethod?: 'transferencia' | 'tarjeta' | 'efectivo' | 'otro'
  startDate?: Date
  endDate?: Date
}

type ApiResponse = {
  message: string
  timestamp: string
  status: number
  data: Transaction[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

/**
 * Obtiene todas las transacciones del usuario
 * @param params - Parámetros de búsqueda y paginación
 */
export async function getUserTransactions(
  params?: TransactionQueryParams
): Promise<{
  data: TransactionsResponse
  status: number
  error: string | null
}> {
  const searchParams = new URLSearchParams()

  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.type) searchParams.set('type', params.type)
  if (params?.category) searchParams.set('category', params.category)
  if (params?.paymentMethod)
    searchParams.set('paymentMethod', params.paymentMethod)
  if (params?.startDate)
    searchParams.set('startDate', params.startDate.toISOString())
  if (params?.endDate) searchParams.set('endDate', params.endDate.toISOString())

  const query = searchParams.toString()
  const { data, status, error } = await apiClient.get<ApiResponse>(
    `/transactions${query ? `?${query}` : ''}`
  )
  return {
    data: {
      transactions: data?.data ?? [],
      pagination: data?.pagination ?? undefined,
    },
    status,
    error: error ?? null,
  }
}

/**
 * Obtiene las transacciones de una parcela específica
 * @param parcelId - ID de la parcela
 * @param params - Parámetros de búsqueda y paginación
 */
export async function getParcelTransactions(
  parcelId: number,
  params?: Omit<TransactionQueryParams, 'parcelId'>
): Promise<{
  data: TransactionsResponse
  status: number
  error: string | null
}> {
  const searchParams = new URLSearchParams()

  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.type) searchParams.set('type', params.type)
  if (params?.category) searchParams.set('category', params.category)
  if (params?.paymentMethod)
    searchParams.set('paymentMethod', params.paymentMethod)
  if (params?.startDate)
    searchParams.set('startDate', params.startDate.toISOString())
  if (params?.endDate) searchParams.set('endDate', params.endDate.toISOString())

  const query = searchParams.toString()
  const { data, status, error } = await apiClient.get<ApiResponse>(
    `/transactions/parcel/${parcelId}${query ? `?${query}` : ''}`
  )
  return {
    data: {
      transactions: data?.data ?? [],
      pagination: data?.pagination ?? undefined,
    },
    status,
    error: error ?? null,
  }
}

/**
 * Obtiene una transacción por su ID
 * @param id - ID de la transacción
 */
export async function getTransactionById(id: number) {
  const { data, status, error } = await apiClient.get<{
    message: string
    timestamp: string
    status: number
    data: Transaction
  }>(`/transactions/${id}`)
  return { data: data, status, error: error ?? null }
}

/**
 * Crea una nueva transacción
 * @param transaction - Datos de la transacción
 */
export async function createTransaction(transaction: {
  parcelId: number
  type: 'ingreso' | 'gasto'
  category: string
  concept: string
  amount: number
  paymentMethod?: 'transferencia' | 'tarjeta' | 'efectivo' | 'otro' | null
  invoiceNumber?: string | null
  date: Date
  description?: string | null
}) {
  const { data, status, error } = await apiClient.post<{
    message: string
    timestamp: string
    status: number
    data: Transaction
  }>('/transactions', transaction)
  return { data: data, status, error: error ?? null }
}

/**
 * Crea múltiples transacciones en lote
 * @param transactions - Array de transacciones
 */
export async function createBulkTransactions(
  transactions: Array<{
    parcelId: number
    type: 'ingreso' | 'gasto'
    category: string
    concept: string
    amount: number
    paymentMethod?: 'transferencia' | 'tarjeta' | 'efectivo' | 'otro' | null
    invoiceNumber?: string | null
    date: Date
    description?: string | null
  }>
) {
  const { data, status, error } = await apiClient.post<{
    message: string
    timestamp: string
    status: number
    data: {
      created: Transaction[]
      failed: any[]
    }
  }>('/transactions/bulk', transactions)
  return { data: data, status, error: error ?? null }
}

/**
 * Actualiza una transacción existente
 * @param id - ID de la transacción
 * @param transaction - Datos a actualizar
 */
export async function updateTransaction(
  id: number,
  transaction: Partial<{
    parcelId: number
    type: 'ingreso' | 'gasto'
    category: string
    concept: string
    amount: number
    paymentMethod: 'transferencia' | 'tarjeta' | 'efectivo' | 'otro' | null
    invoiceNumber: string | null
    date: Date
    description: string | null
  }>
) {
  const { data, status, error } = await apiClient.put<{
    message: string
    timestamp: string
    status: number
    data: Transaction
  }>(`/transactions/${id}`, transaction)
  return { data: data, status, error: error ?? null }
}

/**
 * Elimina una transacción
 * @param id - ID de la transacción
 */
export async function deleteTransaction(id: number) {
  const { data, status, error } = await apiClient.delete<{
    message: string
    timestamp: string
    status: number
    data: { id: number }
  }>(`/transactions/${id}`)
  return { data: data, status, error: error ?? null }
}
