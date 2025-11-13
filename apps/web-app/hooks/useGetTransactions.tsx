'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useTransactionStore } from '@/store/useTransactionStore'
import {
  getUserTransactions,
  getParcelTransactions,
} from '@/lib/transactionsData'
import { useParcelStore } from '@/store/useParcelStore'

interface UseGetTransactionsOptions {
  page?: number
  limit?: number
  type?: 'ingreso' | 'gasto'
  category?: string
  paymentMethod?: 'transferencia' | 'tarjeta' | 'efectivo' | 'otro'
  startDate?: Date
  endDate?: Date
  forceRefresh?: boolean
  cacheTime?: number
}

/**
 * Hook para obtener las transacciones de una parcela o de todas las parcelas
 */
export function useGetTransactions(options: UseGetTransactionsOptions = {}) {
  const {
    page = 1,
    limit = 10,
    type,
    category,
    paymentMethod,
    startDate,
    endDate,
    forceRefresh = false,
    cacheTime,
  } = options

  const { parcelId } = useParcelStore()
  const { getTransactions, getPagination, setTransactions, isStale } =
    useTransactionStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(
    async (force: boolean = false) => {
      if (!parcelId) return

      const transactions = getTransactions(parcelId, page)
      const needsFetch =
        force || transactions.length === 0 || isStale(parcelId, page, cacheTime)

      if (!needsFetch) return

      setIsLoading(true)
      setError(null)

      try {
        let data

        if (parcelId === 'all') {
          data = await getUserTransactions({
            page,
            limit,
            type,
            category,
            paymentMethod,
            startDate,
            endDate,
          })
        } else {
          data = await getParcelTransactions(Number(parcelId), {
            page,
            limit,
            type,
            category,
            paymentMethod,
            startDate,
            endDate,
          })
        }

        setTransactions(data, parcelId, page)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Error al cargar las transacciones'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [
      parcelId,
      getTransactions,
      isStale,
      cacheTime,
      page,
      limit,
      type,
      category,
      paymentMethod,
      startDate,
      endDate,
      setTransactions,
    ]
  )

  useEffect(() => {
    fetchTransactions(forceRefresh)
  }, [parcelId, forceRefresh, page])

  // Función para forzar una recarga manual
  const refetch = useCallback(() => {
    return fetchTransactions(true)
  }, [fetchTransactions])

  // Obtener las transacciones y paginación del store
  const transactions = getTransactions(parcelId || '', page)
  const pagination = getPagination(parcelId || '', page)

  return { transactions, pagination, isLoading, error, refetch }
}
